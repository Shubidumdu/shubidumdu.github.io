---
title: WebAudio API와 WebGPU를 통한 3D 오디오 비주얼라이저 만들기
desc: AudioContext를 이용해 오디오 스트림을 다루고, 이를 3D 파티클 시스템으로 시각화해본다.
createdAt: '2024-03-24'
image:  ./make-3d-audio-visualizer/thumbnail.png
tags:
  - Browser
  - WebAudio API
  - WebGPU
  - BabylonJS
---

## 들어가기

![비주얼라이저 예시](image.png)

<iframe width="560" height="315" src="https://www.youtube.com/embed/bpOSxM0rNPM?si=r3OZNlR0dDZYO1dI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>


**비주얼라이저**(**Visualizer**)는 음악과 소리를 시각적인 형태로 표현해내는 장치 내지는 결과물을 의미합니다. 굳이 위의 예시로 보여드린 기하학적인 형태가 아니더라도, 다양한 방식의 비주얼라이저들이 여러 매체에서 활용 일부 아티스트들은 뮤직비디오를 비주얼라이저로 대체하는 경우도 많습니다. 매력적인 형태로 구축된 비주얼라이저는 음악에 대한 몰입도를 높이고, 나아가서는 음악에서 표현하고자 한 것을 시각적으로 직접 드러내주는 역할도 수행합니다.

웹 브라우저는 강력한 도구이고, WebAudio API 역시 다양한 기능을 지원하기 때문에 오디오 스트림 데이터를 핸들링하여 다양한 내용을 처리할 수 있습니다. 하지만 직접적으로 오디오 활용이 메인이 되는 서비스를 다루는 프론트엔드 개발자가 아닌 이상, 이를 활용하는 일은 좀처럼 없을 것입니다.

저는 이번 기회에 오디오 데이터를 핸들링한 다음, 이를 WebGPU를 거쳐 그럴싸한 형태의 오디오 비주얼라이저를 만들어보고자 합니다.

## AudioContext

Web Audio API를 통한 오디오 데이터를 다루기 위해 가장 먼저 필요한 것은 `AudioContext`의 생성입니다. AudioContext는 포함된 노드의 생성과 오디오 처리 또는 디코딩의 실행을 모두 제어합니다. **모든 작업이 이 컨텍스트 내에서 이루어지기 때문에, 가장 먼저 수행되어야 합니다**. 매번 컨텍스트를 생성하지 않고 하나의 단일 컨텍스트를 만들어 재사용하는 것이 가능합니다. 그렇기 때문에 실제로 여러 오디오 소스 및 파이프라인에 하나의 단일 오디오 컨텍스트를 동시에 사용하는 것이 일반적이며, 실제로도 이 쪽이 권장됩니다.

단순하게 AudioContext를 다루는 것은 AudioContext를 통해 생성한 몇가지 `AudioNode` 객체를 서로 연결 짓는 과정이라고 이야기할 수 있습니다. 아래의 그림은 AudioContext를 통해 구축 가능한 가장 간단한 형태의 파이프라인이며, 사실 이번에 구현하는 내용도 여기서 벗어나지 않습니다.

![가장 간단한 AudioContext 예시](image-1.png)

비유를 하자면, AudioContext를 다루는 것은 기타에 각종 이펙터를 연결하고, 최종적으로는 앰프로 전달하는 일련의 과정과 유사합니다. 최초에 기타가 `SourceNode`가 되고, 그 사이의 각종 이펙터 각각이 `EffectNode`가 되며, 마지막에 도달하게 되는 앰프가 `DestinationNode`가 된다고 볼 수 있습니다.

![alt text](image-14.png)

좀 더 복잡한 구현 예시의 경우는 아래와 같은 형태가 됩니다. 중간의 몇가지 이펙트에 추가로 들어가지만, 결국 큰 그림에서는 **Source - Effect - Destination**의 형태를 유지합니다.

![좀 더 복잡한 AudioContext 예시](image-2.png)

자, 이제 실제로 코드를 작성해볼텐데, 이번에 구현하고자 하는 내용은 그렇게까지 복잡한 것이 아니라서 파이프라인을 구축하는 과정은 이게 전부입니다!

```ts
const audio = document.getElementById('audio') as HTMLAudioElement;

const audioContext = new window.AudioContext(); // AudioContext
const analyser = audioContext.createAnalyser(); // AnalyserNode를 생성
const source = audioContext.createMediaElementSource(audio); // AudioElement로부터 SourceNode를 생성

source.connect(analyser); // SourceNode를 AnalyserNode에 연결
analyser.connect(audioContext.destination) // AnalyserNode를 DestinationNode에 연결
```

![구축한 내용](image-3.png)

### AnalyserNode

위에서 사용된 `AnalyserNode`는 실시간 주파수 및 시간 기반의 분석 정보를 제공하는 노드입니다. **입력된 오디오스트림을 출력으로 그대로 전달하지만, 생성된 데이터를 가져와서 분석 정보를 생성**해주는 역할을 합니다. 저희가 만들고자 하는 오디오 시각화에 아주 적합한 노드입니다.

![AnalyserNode](image-4.png)

## FFT (Fast Fourier Transform: 고속 푸리에 변환)

FFT는 이번에 쓰인 음향 분석 외에도 아주 다양한 분야에 넓게 활용되는 알고리즘입니다. 이에 대해 심도 있게 다루는 것은 상당히 어려운 일이기 때문에, 혹시나 수학적인 원리에 관심이 있으시다면 아래의 영상을 추천드립니다.

<iframe width="560" height="315" src="https://www.youtube.com/embed/Mc9PHZ3H36M?si=mZkuovAgkUnSYnbx" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>


현 시점에서는, 어떤 짧은 시간 동안에 얻게 된 **시간 기반(Time-domain)의 데이터를 주파수 기반(Frequency-domain)으로 변환**해주는 역할을 수행해주는 것을 FFT라고 아주 단순하게 이해해볼 수 있겠습니다.

![FFT 설명 사진](image-5.png)

FFT 자체는 사실 수학적으로 이해하기 어려운 개념이지만, 코드 레벨에서 이를 활용하는 것 자체는 어려운 일이 아닙니다!

아래에서 사용된 `frequencyBinCount`에서, Frequency Bin이란, 주파수 분석에서 사용되는 용어로, 특정 주파수의 범위를 나타내는 작은 구간을 의미합니다. 이제 매 프레임마다 `analyser` 노드로부터 이런 식으로 주파수 데이터를 넘겨받을 수 있게 되었습니다!

```ts
analyser.fftSize = Math.pow(2, 5);

const bufferLength = analyser.frequencyBinCount; // 
const dataArray = new Uint8Array(bufferLength); // 0 ~ 255
analyser.getByteFrequencyData(dataArray); // dataArray에 주파수 데이터가 저장됩니다! 

// ex.) [255, 210, 188, ...]
```

## 그래픽 구현

> **주의**: **아래에서 보여드릴 코드 대부분은 단순히 이해를 돕기 위한 의사 코드로, 그대로 실행한다고 해서 동작하지 않습니다. 또한 꽤 많은 것들이 생략되어 있습니다!**

이제 본격적으로 음향 데이터를 시각적인 형태로 그려내는 작업을 해보겠습니다. 저는 이것을 BabylonJS 라이브러리를 기반으로 파티클 시스템의 형태로 다루어보고자 합니다.

**파티클 시스템**이란 수많은 개수의 미세한 스프라이트 내지는 모델을 통해 퍼지(fuzzy)한 효과를 내는 그래픽스 기법을 의미합니다. 일반적으로는 각 파티클이 매우 혼란스러운 동작을 보이거나, 자연 현상을 묘사해야 하거나 하는 경우에 종종 쓰입니다.

![alt text](image-7.png)

사실, 그래픽 파이프라인의 구축 과정을 전부 다루는 것은 꽤나 범위가 크고 복잡한 내용이라, 본 포스팅에서 모두 다루기에는 무리가 있습니다.

따라서 해당 포스팅에서는 큰 수준에서만 대략적으로 그 내용을 다뤄보도록 하겠습니다.

### 단일 파티클

파티클 시스템은 기본적으로 하나의 파티클을 두고 불규칙한 움직임과 현상을 묘사하는 것이기 때문에, 하나의 파티클을 먼저 다루는 것으로 시작해보겠습니다.

저는 이십면체(Icosahedron) 파티클을 사용했는데, 카메라 뷰에 따라 파티클의 다른 면이 보이게 되면서, 색상이 이리저리 바뀌면 재미있을 것 같았기 때문입니다.

```ts
// Icosahedron 메쉬를 생성합니다.
const mesh = MeshBuilder.CreatePolyhedron('oct', { type: 3, size: 1 }, scene);
```

![alt text](image-6.png)

그리고 프래그먼트 셰이더에서 법선 값에 따라 다양한 색상을 띌 수 있도록 처리해줍니다. 이제 꽤 알록달록한 이십면체를 그릴 수 있게 되었습니다!

```glsl
// ...

const vec3 colorX = vec3(1., 1., 0.);
const vec3 colorY = vec3(0., 1., 1.);
const vec3 colorZ = vec3(1., 0., 1.);

void main() {
  vec3 color = 
    mix(colorX, colorY, vNormal.x) * .4 + 
    mix(colorY, colorZ, vNormal.y) * .4 +
    mix(colorZ, colorX, vNormal.z) * .4;
  outColor = vec4(color, 1.);
}
```

![alt text](image-13.png)

### 파티클 초기화

사실 파티클 시스템을 다루는 것은 성능적인 측면에서 많은 고민이 필요합니다. 거의 수십, 수백만개가 되는 각 파티클의 위치 및 각종 정보에 대한 연산을 매 프레임마다 처리하는 것은 분명 CPU의 입장에서는 부담스러울 수 있는 작업이기 때문입니다. 실제로 기존의 WebGL에서는 이러한 연산을 JS를 거쳐 처리해주어야 했기 때문에, 이 부분에서 분명한 병목이 존재했습니다.

이 상황에서 WebGPU의 컴퓨트 셰이더가 활약합니다. 컴퓨트 셰이더는 렌더링 작업의 엄격한 구조에 제약을 받지 않으면서도, GPU의 대규모 병렬 특성을 활용할 수 있게 해줍니다. 쉽게 말해, 병렬적으로 처리되었을 때 효과적일 것으로 판단되는 알고리즘들을 기존의 JS 쪽에서 GPU로 포팅하여 많은 성능 향상을 꾀할 수 있게 되었습니다.

먼저 충분한 갯수의 파티클을 생성하고, 그 안에 구현을 위한 각종 정보를 전달하겠습니다.
각 파티클에는 본인의 위치 정보와 속도(velocity), 노이즈 값이 할당될 것입니다.
WebGL/WebGPU에서는 GPU 버퍼에 데이터를 넘기고자 할 때에 아래의 `Float32Array`와 같은 `TypedArray`를 사용한다는 점에 유의하세요.

```ts
// 이 값이 스토리지 버퍼에 담기게 됩니다.
const initialParticles = new Float32Array(
    [...new Array(PARTICLE_NUMS)]
      .map(() => {
        const d = 1000;
        const x = d * (2 * Math.random() - 1);
        const y = d * (2 * Math.random() - 1);
        const z = d * (2 * Math.random() - 1);
        return [
          x, // position
          y,
          z,
          0,
          0, // velocity
          0,
          0,
          0, // noise
        ];
      })
      .flat(),
  );

const particleBuffer = new StorageBuffer(initialParticles, ...);

particleBuffer.update(initialParticles);
```

```ts
const uniforms = new UniformBuffer(...);
const computeShader = new ComputeShader(...);

computeShader.setUniformBuffer(uniforms);
computeShader.setStorageBuffer(particleBuffer);
```

또 중요한 것은, 이 스토리지 버퍼에 담긴 각 파티클의 데이터는 실질적인 그리기를 담당하게 될 버텍스 셰이더에서도 마찬가지로 접근할 수 있다는 점입니다.

WebGPU를 사용함으로써 얻게되는 성능 상의 이점이 여기에서 온다고 볼 수 있습니다.
컴퓨트 셰이더를 통해 대규모의 병렬 데이터 연산을 수행한 다음 실질적인 그리기 작업을 진행할 때, 버텍스 셰이더에게 참조 대상 버퍼에 대한 정보 정도만 전달하여 곧바로 버텍스 셰이더 측에서 데이터에 접근할 수 있도록 해줍니다!

다시 말해, 실제로 계산된 결과를 JS를 거쳐 읽기 작업을 수행하여 다시 GPU에 넘겨주어야 한다는 비효율이 발생하지 않는다는 의미입니다.


```ts
const particleMeshMaterial = new ShaderMaterial(...);
mesh.material = particleMeshMaterial;

const positionBuffer = new VertexBuffer(particleBuffer, ...);
const noiseBuffer = new VertexBuffer(particleBuffer, ...);

mesh.setVerticesBuffer(positionBuffer, ...);
mesh.setVerticesBuffer(noiseBuffer, ...);
```

### 파티클 업데이트 및 주파수 데이터 활용

이제 아까 포스트 초반의 주파수 데이터를 `analyser`를 통해 가져다 유니폼으로 사용합니다! 유니폼이란 버텍스/프래그먼트 셰이더 내에서 일관적으로 사용되는 상수값을 의미합니다. 아래에서 활용할 주파수 데이터 역시 유니폼으로 다루기에 적합한 데이터이며, 그 외에도 `deltaTime`, `time` 등의 데이터가 이에 해당됩니다.


```ts
// 매 프레임마다 수행합니다.
onEachRender(() => {
  analyser.getByteFrequencyData(dataArray); // dataArray에 주파수 데이터를 다시 담아서
  const low = dataArray[4]; // 저음부
  const mid = dataArray[8]; // 중음부
  const high = dataArray[12]; // 고음부
  // uniform을 갱신합니다.
  uniforms.update(low, mid, high);
});
```

그리고 이것을 각 셰이더에서 적절히 활용하여 계산해준다면..

```wgsl
// 노이즈의 "자글자글함"의 강도에 각 범위의 주파수 진폭을 활용합니다.
let noise = fbm3d(
  (vec3(1. + .2 * low, 1. + .2 * mid, 1. + .2 * high) 
  * position.xyz * .4 
  + vec3(0, time, 0)) 
  * .3
);
```

```glsl
// 버텍스 셰이더 상에서 파티클이 이루는 구의 반지름에 저음부를 활용하고,
// 파티클이 튀어오르는 높이에 중고음부를 활용합니다.
gl_Position = worldViewProjection * vec4(
  ((.8 + .2 * nLow ) * position + 
  (4. + nLow * 10. + nMid * 20. + nHigh * 20.) * noise * outer), 1.);
```

이제 음악에 맞추어 파티클이 튀어오르는 효과를 줄 수 있습니다!

![alt text](image-12.png)

## 결과물

<iframe
  id="Visualizer"
  title="Visualizer"
  loading="lazy"
  width="800"
  height="600"
  style="margin:0 auto; max-width: 100%;"
  src="https://shubidumdu.github.io/sketchbook/pages/visualizer/"
>
</iframe><br>

## 마치며

개인적으로 굉장히 좋아하는 음악과 그래픽, 두가지를 한데 뭉친 형태의 결과물을 구현하다 보니, 그 과정이 굉장히 재미있었습니다.

나름대로 만족스러운 형태의 작업 결과를 얻었고, 이를 기반으로 더 많은 것들을 다룰 수 있게 되었다는 생각에 기분이 좋네요. :)
