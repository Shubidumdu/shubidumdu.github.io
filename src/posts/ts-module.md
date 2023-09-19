---
title: TS의 관점에서 CJS/ESM 모듈 이해하기
desc: CJS와 ESM로 이분화된 JS의 모듈 생태계를 TS의 관점에서 살펴본다.
createdAt: '2023-09-20'
image: ./ts-module/thumbnail.png
tags:
  - JavaScript
  - TypeScript
  - NodeJS
---

## 들어가기

TS에서의 모듈 시스템은 생각보다 더 복잡하다. 라이브러리를 일반적으로 사용하는 입장에서는 이를 인지하기 어렵고, 나 역시 그런 상황이었다. 그러던 중 최근 직접 라이브러리를 각각의 모듈 시스템을 타깃으로 빌드 및 배포해보아야 하는 상황이 되었는데, 이 부분에서 여러 문제를 겪었다. 겪은 문제가 무엇이었는지, 또 이를 이해하기 위해 어떤 흐름을 밟았는지 되짚어보려고 한다.

## 배경

과거 JS에 모듈이란 존재하지 않았다. JS가 웹페이지에서 차지하던 비중은 상당히 작았기 때문이다. 거대한 스크립트가 필요한 경우 자체가 많지 않았다. 헌데 오랜 기간이 지난 지금은 JS가 존재하지 않는 페이지를 보는 것이 더 힘들 정도로 그 비중이 커졌다.
심지어는 브라우저 컨텍스트가 아닌데도 JS를 사용하는 경우가 많아졌다. 이로 인해 JS 프로그램을 필요한 경우에만 가져올 수 있도록 별도의 모듈로 분할하고자 하는 시도들이 있었고, 그 중심에 NodeJS가 있었다.

## CommonJS

여기서 NodeJS에서는 **CommonJS**(CJS)라는 모듈 시스템을 줄곧 사용해왔는데, 이는 `require`와 `module.exports`를 통해 모듈을 가져오고 내보내는 방식이다.

```JS
// import
const myModule = require('./my-module');

// export
module.exports = { something };
```

## ES Module

그러다가 모던 브라우저에서 기본적으로 모듈 기능을 지원하기 시작했다. 이는 크롬 기준으로 v61, 2017년 쯤이고, 이 때 등장한 것이 바로 **ES Module** 방식이다.

```JS
// import
import { myModule } from './my-module';

// export
export { something };
```

## In TypeScript

`아! 그럼, 문법만 잘 살펴보면 지금 내 프로젝트 환경이 ESM 기반인지, CJS인지 알 수 있겠다!`

라고 생각할 수 있겠지만, 사실 그렇게 쉽지 않다.

실제로 TS에서는 단순히 문법만 보고서 어떤 모듈 시스템을 사용하고 있는지 쉽게 파악하기가 어렵다.

가령 프로젝트 구성에 따라 차이가 있겠지만, 대체로 아래처럼 문법 자체가 완전히 동일한데 적용되고 있는 모듈 시스템은 다를 수 있다.

```ts
// 이건 ES Module 입니다.
import axios from "axios";

// 그리고 이건 CommonJS 입니다..?
import axios from "axios";
```

### 그럼 어떻게 구분하나?

내 프로젝트가 JS 파일을 다루는 데 있어 어떤 모듈 시스템을 사용하는지에 대한 판단은, `package.json` 내에 선언한 `type` 필드를 확인하면 된다.

```json
{
  // CJS
  "type": "commonjs" // default
}
```

```json
{
  // ESM
  "type": "module"
}
```

### `tsconfig.json` 관련

그런데 TS를 사용한다면, 단순히 `package.json`에 `type` 필드 외에도, `tsconfig` 설정에도 주의를 기울여야 한다.
내가 살펴봤을 때, 이와 관련된 가장 주요한 필드들은 두 가지 정도가 있었다.

#### `module`

[module](https://www.typescriptlang.org/tsconfig#module) 필드는 프로그램의 모듈 시스템을 설정한다. 이는 `tsc`를 통한 **빌드 결과물**에 직접적인 영향을 미친다.

#### `moduleResolution`

`moduleResolution` 필드는 TS 컴파일러가 **모듈을 해석하는 방식**을 설정한다. 이는 앞서 설정한 `module` 필드에 영향 받을 수 있다. `module`에 어떤 값을 설정했는지에 따라 기본값이 달라지는데, 아래와 같다.

> 1. `module`이 `ES6/ES2015`, `AMD`, `UMD`, `System` 중 하나 -> `classic`
>
> 2. `module`이 `Node16`, `NodeNext` -> `module`과 동일하게 설정됨
>
> 3. 그 외의 경우 -> `Node`

## 환경 구성 시 주의할 점

실제로 여기까지 이해하기에는 어렵지 않은데, 막상 환경을 구성하고 빌드해보려 하면 생각보다 많은 부분에서 제약이 있다.

### `module`이 `NodeNext`라면, `moduleResolution`도 `NodeNext`로 설정해야 한다

`NodeNext`는 현재 TS로 NodeJS 프로젝트를 구성할 때 가장 추천되는 옵션이다.

근데, 이 두 필드 옵션은 항상 같이 설정되어야 한다. 그렇지 않으면 실제로 에러가 발생한다.

```bash
Option 'module' must be set to 'NodeNext' when option 'moduleResolution' is set to 'NodeNext'.
```

여기서 `NodeNext` 옵션은 NodeJS가 ESM과 CJS가 공존하는 특정 구현을 위해 설계된 새로 추가된 해상도 모드를 의미한다.

이 옵션은 내 프로젝트의 `package.json`에 작성한 `type` 필드(`module` or `commonjs`)와, 임포트 대상 패키지의 `exports` 필드를 참고하여, 무려 **알아서** 프로젝트의 모듈 시스템과 모듈 해석 방식을 결정해준다!

실제로 동일한 `axios` 라이브러리를 가져와 사용하는 코드가 있다고 했을 때, `tsconfig.json`의 내용이 동일하더라도, `package.json`의 `type` 필드에 따라 tsc의 결과가 다음과 같이 각각 다르게 나타난다!

```js
// type: module
import axios from "axios";
console.log(axios.isCancel);
```

```js
// type: commonjs
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
console.log(axios_1.default.isCancel);

```

#### 그럼 그냥 무조건 `NodeNext` 쓰면 되는 거 아닌가?

나도 얼핏 그런 생각이 들었는데, 이 때 개발 경험에 영향을 미치는 한 가지 문제가 있다.

이 문제는 `type: module`를 통해 ESM 기반으로 모듈을 사용하려 할 때 발생한다.

다음과 같이 직접 작성한 모듈이 하나 있다고 하자.

```ts
// module.ts
const doSomething = () => {
  console.log("wow!");
};

export { doSomething };
```

이것을 `index.ts`에서 상대 경로로 다음과 같이 가져와 사용하려고 하면, 다음과 같은 에러가 출력된다!

```ts
// index.ts

// [ERROR] Relative import paths need explicit file extensions in EcmaScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Did you mean './module.js'? ts(2835)
import { doSomething } from "./module";

doSomething();
```

해당 오류가 뜨는 이유는 메시지에서 잘 드러나는데, `moduleResolution`이 `Node16` 또는 `NodeNext`일 때는, 상대 경로로 모듈을 가져올 때 **확장자를 명시해주어야 한다는 것**이다.

이게 상당히 이상하다고 느껴지는 이유는 실제 파일명은 `module.ts`인데, 에러는 `module.js`로 확장자를 바꿀 것을 요구하기 때문이다. (심지어 파일 시스템에는 존재하지도 않는 파일인데도!)

#### 1. 애초에 왜 ESM은 확장자를 명시해야 하는가? CommonJS에서는 확장자를 추측할 수 있지 않은가?

> 이는 ES Module이 `인터프리터는 파일 확장자를 추측하지 않는다`라는 ECMAScript 표준을 따르기 때문이다. CommonJS는 ES6가 완성되기도 전에 갖춰진 모듈 시스템이고, 이미 파일 확장자를 추측하는 형태의 동작을 수행하고 있었기 때문에, 이 부분에서 차이를 보인다.

#### 2. 그럼 왜 `.ts`가 아닌, 존재하지도 않는 `.js`로 확장자를 입력할 것을 요구하는 것인가?

> 이는 실제로도 갑론을박이 많은 부분인데, "실제로 존재하는 `.ts` 파일을 확장자로 사용해야 한다"라는 요구 사항에 대해 TS 개발 팀 리드 [Ryan에 따르면](https://github.com/microsoft/TypeScript/issues/49083#issuecomment-1125258055) "`이미 타깃에 적절하게 작성된 JS 코드를 그것과 다르게 재작성하지 않는다`"라는 원칙을 내새우며 거부했기 때문이다. 덕분에 아래에서 스크린샷에서 볼 수 있듯이, 아주 많은 수의 역따봉을 확인할 수 있다.
>
> ![Typescript issue capture](image.png)
>

### 결국 ESM 기반의 프로젝트라면 `NodeNext` 옵션을 사용할 경우 개발 경험이 상당히 불편해질 수 있다

위의 확장자 관련 이슈로 개발 경험이 상당히 낯설게 느껴질 수 있다. (적어도 내가 느끼기엔 그렇다.)

이 경우 `module`을 `ES[...]`로, `moduleResolution`을 `Bundler`로 설정하면 확장자 관련 이슈 자체는 해결이 된다.

`Bundler`는 오직 `ES2015` 이후로 설정한 `module` 필드와 함께 사용할 수 있다.
이는 `NodeNext` 및 `Node16`과 유사하게, 사용하고자 하는 라이브러리 내 `package.json`의 `exports` 필드를 참조하여, 라이브러리 모듈을 해석한다.

단 주요한 차이가 하나 있는데, **import의 상대 경로에 대한 파일 확장자를 요구하지 않는다**는 점이다. 덕분에 비직관적인 확장자를 일일이 작성할 필요 없이, CJS 모듈을 사용할 때와 거의 유사한 개발 경험을 유지할 수 있다.

근데 이 경우 빌드 결과에 약간 문제가 생긴다. 이 때는 `tsc`를 수행한 컴파일링 결과물에도 명확한 파일 확장자가 추가되지 않는다. 이는 다시 말해 ECMAScript 표준을 지키지 않은 결과가 되며, 이를 그대로 브라우저에서 사용하는 것은 불가능한 상태가 된다.

```ts
// index.ts
import { doSomething } from "./module";

doSomething();
```

```js
// index.js - tsc 결과물
import { doSomething } from "./module"; // 여전히 확장자가 없다.
doSomething();
```

이 때문에 추가적인 번들링 과정이 필요해진다. 애당초 해당 옵션의 이름이 `Bundler`인 이유를 추측해볼 수 있다.

### 그래서 rollup을 쓰나보다

솔직히 말하면 그 전까지는 라이브러리를 빌드하는 과정에서 대체 rollup을 써야하는 이유가 무엇인지에 대해 도통 감을 잡지 못했다. 이미 `tsc`를 통해 충분히 각 ESM/CJS 모듈 시스템을 타깃으로 컴파일링을 수행할 수 있다면, 굳이 번들러를 따로 가져다 써야할 이유를 찾지 못했기 때문이다.

다시 생각해보면, 라이브러리 빌드에 있어 rollup과 같은 별도의 번들러를 추가하여 다음과 같은 이점을 챙길 수 있겠다.

#### ESM/CJS 모듈 시스템 양쪽을 타깃으로 `tsc`보다 훨씬 수월하게 빌드를 수행할 수 있다

앞서 언급한 것처럼, ESM/CJS 모듈 시스템을 모두 타깃으로 빌드하는 라이브러리를 빌드하고자 하는 경우 아래 이유로 `tsc` 만으로는 상당히 벅찰 수 있다.

- CJS를 타깃으로 한 빌드는 그런대로 수월하다.
- 다만, ESM를 타깃으로 한 빌드에 있어 다음의 문제 중 하나가 발생하게 될 것이다.
  - `moduleResolution`을 `NodeNext`로 설정할 경우, 상대 경로로 TS 모듈을 가져올 때 `.js` 확장자를 명시해줘야만 한다. 이는 상당히 비직관적이다.
  - `moduleResolution`을 `Bundler`로 설정할 경우, 빌드 결과물에 상대 경로 import에 대한 `.js` 확장자가 명시되지 않는다. (결국 추가적인 번들링이 요구된다.)

결국 애초에 rollup과 같은 번들러를 사용하면, ESM/CJS 모듈 시스템 양쪽을 타깃으로 쉽게 빌드할 수 있다. rollup 내 각종 옵션과 플러그인으로 빌드 구성을 유연하게 할 수 있다는 점도 장점이다.

#### (추가로) 프로젝트가 ESM 기반일 경우, 트리 셰이킹을 적용할 수 있다

프로젝트가 ESM 기반으로 구성된 경우 트리 셰이킹을 적용할 수 있다. 덕분에 사용하지 않는 코드는 빌드 시점에서 제거할 수 있게 해준다.

## 마치며

이번 포스트에서는 직접 TS로 구성된 라이브러리를 `tsc`만으로 ESM/CJS 타깃으로 빌드하고자 했을때 마주했던 문제들과, 그 이유를 파악하기 위해 이래저래 찾아보고, 그 내용을 정리해보았다.

이렇게 포스트를 작성하며 새롭게 배우고 이해하게 된 점이 상당히 많다. 또 이렇게 새로운 문제를 마주하고, 이해하고 해결해나가는 과정에서 한 단계 성장했음을 작게나마 느낀다.

기술 블로그를 새로 시작한 건 분명 잘한 일인 것 같다. :)

## 참고

- <https://stackoverflow.com/questions/65873101/node-requires-file-extension-for-import-statement/65874173#65874173>
- <https://github.com/microsoft/TypeScript/issues/49083>
- <https://www.reddit.com/r/typescript/comments/uuivss/module_node16_should_support_extension_rewriting/>
- <https://www.typescriptlang.org/tsconfig#module>
