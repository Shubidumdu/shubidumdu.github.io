---
title: PixiJS로 구현해보는 실시간 페인팅
desc: PixiJS를 활용하여 간단한 제너러티브 아트를 만들어본다.
createdAt: '2023-10-11'
image: ./pollock-with-pixijs/thumbnail.png
tags:
  - PixiJS
---

## 들어가기

![잭슨 폴록의 그림](image.png)

잭슨 폴록(Jackson Pollock)은 추상표현주의 화가로, "액션 페인팅"이라는 이름으로 많이 알려진 드리핑 기법을 창안한 것으로 많이 알려져 있다. 그의 작품은 대부분 우연성과 무작위성이 강하다는 특징이 있는데, 이 부분을 잘 살려서 HTML 캔버스에 직접 구현해보면 어떨까 하는 생각이 들었다.

## PixiJS?

![PixiJS 타이틀](image-1.png)

PixiJS는 주로 2D 작업물들을 다루기 위한 WebGL 기반의 라이브러리로, WebGL을 로우 레벨로 사용하는 대신, 추상화가 잘 되어있는 API를 활용해 보다 쉽게 그리기 작업을 처리할 수 있게 해준다.

아래는 예시로 간단하게 빨간 사각형을 그려보는 코드이다.

```js
const graphics = new PIXI.Graphics();

// Draw red rectangle with PixiJS
graphics.beginFill(0xDE3249);
graphics.drawRect(50, 50, 100, 100);
graphics.endFill();
```

전반적으로 볼 때는 기존 캔버스의 2D 컨텍스트 API와 비슷한 형태를 띄고 있다는 점이 눈에 띈다. (아래 예시)

```js
const ctx = canvas.getContext("2d");

ctx.fillStyle = "#DE3249";
ctx.fillRect(50, 50, 100, 100);
```

## 구현

완전히 똑같은 형태로는 구현하는 것이 불가능하겠지만, 개인적으로 저 특유의 물감이 튀는 듯한 느낌을 비슷하게나마 살려보고 싶었다. 또 실제로 액션 페인팅이 이루어지는 것처럼 나타내고 싶어서, 이러한 그리기 작업이 실시간으로 이루어졌으면 좋겠다는 생각이었다.

마치 사람이 붓으로 그린 듯한 느낌을 준다는 것이 상당히 어려운 부분이었는데, 대부분의 그래픽 라이브러리들에서 선을 그릴 때는 아래 그림처럼 아주 정직한 형태를 띄기 때문에, 무작위성이 강조되는 요구 사항에 대해서는 이걸 쓰는 것이 불편한 상황이었다. ([원본](https://pixijs.com/playground?exampleId=graphics.advanced))

![PixiJS 예시](image-2.png)

결국 생각한 건, 말 그대로 선을 그리는 API를 가져다 사용하기 보다는, 무수하게 많은 점을 찍어 이걸 마치 불규칙한 형태의 선처럼 보이게끔 하는 것이다.

즉, 실제로 선 그리기 API를 사용하는 것이 아니라, 파티클 시스템처럼 점을 이래저래 이동시켜 가면서 그 경로를 따라 그리기를 처리한다.

```ts
const app = new Application();
const graphics = new Graphics();

app.ticker.add(() => {
  // x, y 를 이동
  // ...
  
  graphics.beginFill(color);
  graphics.moveTo(x, y);
  graphics.drawCircle(x, y, size);

  // ...
})

graphics.endFill();
```

![불규칙한 선 그리기의 원리](ezgif-3-c36e24f84b.gif)

그리고 매 틱마다 각 점에 대한 그리기 작업을 그대로 수행해주면 다음과 비슷한 형태의 결과를 얻는다.

![그리기 결과](image-3.png)

## 메모리 이슈

사실, 여기엔 치명적인 문제가 한가지 있는데, 여기서 내가 하는 작업은 매 프레임마다 `drawCircle` 명령으로 새로운 점 인스턴스를 **생성**시킨다는 점이다.

```js
const circle = graphics.drawCircle(x, y, size); // 새로운 원 인스턴스를 생성
```

일단 생성하고 난 이후의 원 인스턴스는 JS 힙을 차지하게 되며, 그리기 작업이 많이 진행될수록 이는 심각한 성능 저하로 이어진다.

이건 성능 모니터 상으로도 명확하게 나타나는 문제인데, 이를테면 시작할 때는 아래와 같은 지표를 보이다가

![FPS 지표1](image-7.png)

![성능 모니터1](image-4.png)

프레임 저하와 더불어 지표가 점점 난리가 나기 시작한다.

![FPS 지표2](image-6.png)

![성능 모니터2](image-5.png)

## 렌더 텍스처 (Render Texture)

사실 구현하고자 하는 내용은 생성한 인스턴스를 가지고서 뭔가를 하는 것이 아니다. 그저 각각의 점이 이동하는 경로를 따라 그리기 작업이 계속 이루어지기만 하면 된다.

그렇기 때문에 우선 그리기 작업만 처리하고 나면 인스턴스 자체는 필요가 없다. 근데, 현재는 `clear`로 인스턴스를 없애버렸을 때 그려둔 원들이 전부 사라져버린다. 결국 이전의 그리기 결과를 계속 유지해가면서 그 위에 새로운 그리기 작업을 수행하는 것이 필요한 상황이다.

아니나 다를까 PixiJS에서도 이를 위한 API를 제공한다. [RenderTexture](https://pixijs.download/release/docs/PIXI.RenderTexture.html)는 PixiJS의 모든 디스플레이 객체를 렌더링할 수 있는 특수 텍스처이다. 렌더링된 내용에 대한 스냅샷을 렌더 텍스처에 찍는다고 생각해도 되겠다.

```js
const renderTexture = RenderTexture.create({
  width: app.screen.width,
  height: app.screen.height,
}); // 애플리케이션의 크기와 동일한 렌더 텍스처를 만들고

const outputSprite = new Sprite(renderTexture); // 그 결과를 스프라이트로 만들어준다.

app.stage.addChild(outputSprite); // 이제 이걸 애플리케이션 스테이지에 추가해준다.
```

이후 그리기 과정에서 매 틱마다 렌더 텍스처에 렌더링을 수행한 후, 이후 그렸던 그래픽에 대해서는 `clear` 해준다. 한편 `renderTexture`에 대한 그리기에서는 `clear`를 수행하지 않음으로써, 이전에 그렸던 결과를 유지한다는 점이 중요하다.

```js
app.ticker.add((delta) => {
  // ...

  // 렌더 텍스처에 렌더링한다.
  app.renderer.render(graphics, {
    renderTexture,
    clear: false, // 이전 그리기 결과는 보존한다.
  });

  // 그리고 나서 그렸던 그래픽 인스턴스들은 지운다.
  graphics.clear();
});
```

이제 성능 지표가 훨씬 안정적이다.

![FPS 지표3](image-9.png)

![성능 모니터3](image-8.png)

## 시드값에 따라 고유한 그림 그리기

제너러티브 아트답게 단순히 사전에 지정한 값을 통해 색상과 그리기 패턴을 구성하기 보다는, 이용자가 임의의 시드값을 입력할 때, 저마다 고유하면서도 멱등한 형태의 그리기 작업을 할 수 있으면 좋겠다는 생각이 들었다.

이를 위해서는 그리기 작업을 하는 데에 있어 `Math.random`을 사용해선 안된다. JS에서는 `Math.random`에 시드를 지정할 수 없기 때문에, 매번 다른 랜덤값이 반환되어 동일한 결과를 보장할 수 없다.

결국 따로 라이브러리를 사용해야 하는데, [**pure-rand**](https://www.npmjs.com/package/pure-rand)라는 라이브러리가 딱 적당했다.

내 경우에는 이 라이브러리를 사용하여 시드값에 기반하여 랜덤한 값을 만들어주는 작업을 하나의 관심사로 묶어 처리하고 싶어서, 직접 `RandomValueGenerator`라는 클래스를 만들어 사용했다.

```js
export class RandomValueGenerator {
  private rng: RandomGenerator;

  constructor(seed: number) {
    this.rng = prand.xoroshiro128plus(seed);
  }

  next() {
    const num = this.rng.unsafeNext();
    return num;
  }

  // 범위 내 실수를 반환
  distribute(min: number, max: number) {
    const out = (this.next() >>> 0) / 0x100000000;
    return min + out * (max - min);
  }

  // 범위 내 정수를 반환
  distributeInt(min: number, max: number) {
    const out = prand.unsafeUniformIntDistribution(min, max, this.rng);
    return out;
  }

  // 임의의 색상 hex값을 반환
  hexColor() {
    const num = this.distribute(0, 0xffffff);
    return `#${Math.floor(num).toString(16).padEnd(6, '0')}`;
  }
}

```

이를 통해 생성한 값은 각 그리기 작업 때마다 원의 위치를 새로 계산하거나 원의 색상과 그리기 패턴을 결정할 때에 사용된다.

그리기 작업에 있어 노이즈가 필요한 상황이라 여기에 [**simplex-noise**](https://www.npmjs.com/package/simplex-noise)라는 라이브러리를 사용했는데, 여기에도 앞서 만든 클래스를 사용해 고유한 노이즈를 만들어내도록 할 수 있다.

```js
import { createNoise2D } from 'simplex-noise';

const random = new RandomValueGenerator(seed);
const noise2D = createNoise2D(() => random.distribute(0, 1));
```

이제 남은건 시드값을 이용자가 임의로 설정할 수 있도록 하는 것인데, 여기에서는 쿼리스트링을 사용했다. 이용자가 지정한 시드값을 포함해 그대로 URL을 복사해 다른 이에게 전달해주면, 다른 사람 역시 고유한 결과를 확인할 수 있도록 처리해주고 싶었기 때문이다.

```js
const url = new URL(window.location.href);
const searchParams = new URLSearchParams(location.search);
const seed = Number(searchParams.get('seed')) || 0; // 따로 입력한 시드값이 없으면 0으로 초기화
```

### 불완전한 멱등성

시드값에 기반해서 고유한 색상과 그리기 패턴을 유지하며 그리기를 수행할 수 있게 되었으나, 이따금씩 새로고침을 해보면 이전의 그리기 내용과 완전히 동일하지는 않다는 문제가 있었다. (이를테면, 그리는 위치나 방향이 다르다던가)

다시 말해 완전한 멱등성을 지니고 있지 않았다. 그 이유는 바로 아래처럼 `delta`에 기반하여 계산한 경과 시간을 분기점으로 체크한 후 그 내부에서 랜덤값을 생성하여 처리하는 부분이 있었는데, 이 과정에서 각각의 랜덤값을 생성하는 순서가 보장되지 않기 때문이다.

앞서 만든 `RandomValueGenerator` 내부에서 사용하는 라이브러리의 각 API 메서드가 `unsafe[...]`라는 이름을 갖는 것도 이 이유에서다. 호출 순서에 따라 결과가 달라질 수 있기 때문이다.

```js
let time = 0;

app.ticker.add((delta) => {
  time += delta;
  // ...
});

const initLineDrawer = (options) => {
  // ...
  let startTime = time;

  return () => {
    const progress = time - startTime;
    if (progress > Math.PI / 2) {
      // 랜덤값에 따른 처리가 이루어지는 부분
    }
  }
  // ...
}
```

헌데 `delta`에 대한 멱등성을 갖추는 것은 사실 불가능하다. `delta`값은 현재 프레임과 이전 프레임 사이의 경과 시간을 의미하는데, 해당값 자체가 다양한 요인에 의해 변경될 수 있기 때문이다. (디바이스 사양 / 모니터 재생률 등등)

해결 방법 자체는 간단하다. `delta`를 사용하지 않으면 된다. 이 부분에서 `delta` 대신 임의의 값으로 처리해주면 된다. 이 경우 `delta`가 변하지 않으니, 완전한 멱등성을 갖추는 것이 가능해진다.

```js
time += 1 / 48; 
```

## 결과

<iframe
  id="Pollock"
  title="Pollock"
  loading="lazy"
  width="800"
  height="600"
  style="margin:0 auto; max-width: 100%;"
  src="https://blog.shubidumdu.com/sketchbook/pages/pollock"
>
</iframe><br>

우측 하단의 `Change Seed`를 통해 시드값을 변경하여 임의의 결과를 얻어볼 수 있다. 어떤 숫자를 넣었을 때가 제법 아름다운 결과를 만들어내는지 찾아보는 것도 꽤 재밌다. `iframe`의 크기가 좀 작아 [새 창으로 보는 것](https://blog.shubidumdu.com/sketchbook/pages/pollock/)을 추천한다.

## 마치며

원래는 불규칙한 선을 그리고, 페인트가 튀기는 듯한 느낌을 주기 위한 방법에 대한 구현의 과정도 이 글에서 다루고자 했으나 글이 너무 길어지는 감이 있고, 너무 디테일한 부분까지 굳이 설명하고자 하는 것 같은 느낌이 들어 과감하게 생략하였다.

PixiJS는 확실히 추상화가 잘 된 API 덕분에 WebGL을 베이스로 그리기를 처리할 때 훨씬 간편하게 사용할 수 있다는 장점이 있었다. 무엇보다도 WebGL을 로우 레벨로 다룰 때는, 간단한 그리기 작업을 할 때에도 이래저래 보일러플레이트를 작성해야 하는 것이 여간 귀찮은 일이 아니었는데, 이런 부분을 대신 처리해주는 것이 상당히 편리했다. (human-readable한 코드는 덤이다.) 앞으로도 캔버스 위에 2D 베이스의 그래픽 작업을 할 때는 종종 사용할 것 같다.

다만 개인적으로 느끼기에는 러닝커브가 좀 완만하다는 느낌을 받았다. WebGL을 사용할 줄 안다고 해서 PixiJS도 마냥 쉽게 다룰 수 있다기 보다는, 이 쪽은 이 쪽대로 익혀야 하는 부분이 많은 것 같다. (근데 이건 어느 라이브러리라도 비슷할 것 같긴 하다.)

아무튼 좀 더 익숙해지면 좀 더 재밌는 작업물들을 만들어볼 수 있을 것 같다. 이번에는 간단하게나마 사용법을 대략적으로 익혔다는 점에 의의를 둔다. :)
