---
title: Structural Sharing in React Query
desc: 필요할 때만 리렌더링 시키는 React Query의 마법 하나
createdAt: '2024-01-16'
image: ./react-query-structural-sharing/thumbnail.png
tags:
  - React
  - Typescript
---

## 들어가기

최근에 회사에서 일을 하면서 이런 일이 있었습니다.

아래와 같이, `useQuery` hook을 통해 API 호출을 통해 데이터를 가져와서 이걸 다른 컴포넌트에 전달해주는 상황이었습니다.

```tsx
const { data } = useQuery({
  queryKey: 'someKey',
  queryFn: () => fetchSomeData(),
});

return <SomeComponent data={data} />;
```

무슨 일이 일어날까요? 아마 예상한대로 `SomeComponent`는 `data` prop을 넘겨받아 렌더링을 수행할 것입니다.

자, 여기까지는 예상한대로입니다. 문제는 그 다음인데, 아래의 의사 코드를 한번 살펴보겠습니다.

```tsx
// API 호출 Mock
const fetchSomeData = async () => {
  return { foo: 'bar' };
};

const { data, refetch } = useQuery({
  queryKey: 'someKey',
  queryFn: async () => await fetchSomeData(),
});

return (
  <>
    <SomeComponent data={data} />
    <button onClick={refetch}>Refetch</button>
  </>
);
```

그리고 `SomeComponent` 내부에 아래와 같은 `useEffect`가 있다고 가정합니다.

```tsx
// SomeComponent.tsx
useEffect(() => {
  alert('data refetched!');
}, [data]);
```

자 그럼 여기까지 코드를 파악해보니, 아마도 버튼을 클릭하면 `refetch`가 호출되고, 이에 따라 `data`가 변경되고, 그에 따라 `SomeComponent`가 리렌더링되고, `useEffect`가 동작해서 `alert`가 호출될 것 같네요. 그렇지 않나요??

놀랍게도 실제로는 그렇지 않습니다. (저만 놀라운가요?)

실제로는 `refetch`가 호출되거나 해서 실제로 data fetch가 일어났더라도, `SomeComponent`는 리렌더링되지 않습니다. 그리고 `useEffect`도 동작하지 않습니다.

이유는 무엇일까요?

## Structural Sharing

비밀은 React Query가 내부적으로 수행하는 **렌더링 최적화**에 있고, 그 중에서도 정확하게는 **[Structural Sharing](https://tkdodo.eu/blog/react-query-render-optimizations#structural-sharing)** 때문(덕분?)입니다.

Structural Sharing은 React Query의 `useQuery` hook을 사용할 때, 기본적으로 적용되는 옵션입니다. 해당 기능을 사용하면 `data`를 단순 참조 비교를 통해 데이터가 변경되었음을 감지하는 것이 아닌, 모든 수준에서 식별할 수 있습니다. (원문에서는 참조 무결성, **referential integrity**이라고 표현하고 있습니다.)

아래 예시를 하나 살펴보겠습니다. 백엔드로부터 TODO 리스트를 가져오는 API 함수가 있고, 이를 호출하여 아래와 같은 데이터를 가져온다고 가정합니다.

```json
[
  {
    "id": 1,
    "title": "Todo 1",
    "completed": false
  },
  {
    "id": 2,
    "title": "Todo 2",
    "completed": false
  },
  {
    "id": 3,
    "title": "Todo 3",
    "completed": false
  }
]
```

애플리케이션이 동작하면서, `id`가 `1`인 todo를 "완료" 상태로 전환하고, `id`가 `2`인 todo의 제목을 변경한다고 가정합시다.

```json
[
  {
    "id": 1,
    "title": "Todo 1",
    "completed": true // 변경
  },
  {
    "id": 2,
    "title": "Edited Todo 2", // 변경
    "completed": false
  },
  {
    "id": 3,
    "title": "Todo 3",
    "completed": false
  }
]
```

그러면, React Query는 이전의 상태와 새로운 상태를 **최대한** 비교하여, 변경된 부분만을 감지하여 상태를 갱신합니다.

앞선 예시를 바탕으로 보자면, `id`가 `1`인 todo는 `completed`가 변경되었고, `id`가 `2`인 todo는 `title`이 변경되었으므로, 이 두 todo 객체에 대한 참조는 변경됩니다. 하지만 `id`가 `3`인 todo는 변경된 부분이 없으므로, 이 객체에 대한 참조 자체는 변경되지 않습니다. 하지만, 앞선 두 객체에 대한 참조가 변경되었으므로, 결론적으로 반환되는 Array의 참조 자체는 변경됩니다.

이게 어떤 의미가 있을까요? 이를테면, 아래처럼 특정한 todo 객체만을 가져다 사용하는 경우, `id`가 `3`인 todo 객체에 대한 참조는 변경되지 않았기 때문에, 이를 상태로 사용하는 경우 불필요한 리렌더링은 일어나지 않습니다.

```tsx
const { data: thirdTodo } = useQuery({
  queryKey: 'todos',
  queryFn: () => fetchTodos(), // 위의 json 예시를 반환받습니다.
  select: (data) => data.find((todo) => todo.id === 3),
});
```

덧붙이자면, 위의 예시처럼 `select` 콜백을 통해 selector를 사용한 경우, Structural Sharing은 **2번** 수행됩니다. 한번은 `queryFn`에서의 반환값에 대해, 그리고 한번은 `select` 콜백에서의 반환값에 대해 수행됩니다.

## Structural Sharing의 마법

대체 내부적으로 어떤 마법을 부리길래 이런 깊은 변화를 감지하는 걸까요? 
Array 참조 자체는 변하지만, 실질적으로 변하지 않은 객체 아이템에 대한 참조는 유지하다뇨!

사실 여기에 별다른 마법은 없습니다. 말 그대로 `Array`와 `Object`의 각 프로퍼티에 대해 **재귀적으로** 깊게 비교하는 것이 전부입니다.

아래는 실제 React Query 내 이러한 Structural Sharing에 사용되는 `replaceEqualDeep` 함수의 **전체 코드**입니다.

```ts
/**
 * This function returns `a` if `b` is deeply equal.
 * If not, it will replace any deeply equal children of `b` with those of `a`.
 * This can be used for structural sharing between JSON values for example.
 */
export function replaceEqualDeep<T>(a: unknown, b: T): T
export function replaceEqualDeep(a: any, b: any): any {
  if (a === b) {
    return a
  }

  const array = isPlainArray(a) && isPlainArray(b)

  if (array || (isPlainObject(a) && isPlainObject(b))) {
    const aSize = array ? a.length : Object.keys(a).length
    const bItems = array ? b : Object.keys(b)
    const bSize = bItems.length
    const copy: any = array ? [] : {}

    let equalItems = 0

    for (let i = 0; i < bSize; i++) {
      const key = array ? i : bItems[i]
      copy[key] = replaceEqualDeep(a[key], b[key])
      if (copy[key] === a[key] && a[key] !== undefined) {
        equalItems++
      }
    }

    return aSize === bSize && equalItems === aSize ? a : copy
  }

  return b
}
```

위에서 보시다시피, `replaceEqualDeep` 함수는 단순하게는 `a`와 `b`를 비교하여, 두 값이 동일하면 이전값 `a`를 반환하고, 그렇지 않으면 새로운 값 `b`를 반환합니다.

이 때, 두 값이 `Array` 혹은 `Object`인 경우, 각 프로퍼티에 대해서도 `replaceEqualDeep`을 수행합니다. 이러한 과정에서 `copy`란 명칭으로 새로운 객체를 생성하고, 만약 동일한 데이터로 판단되지 않는 경우, 이 `copy`를 반환합니다. 

그에 대한 결과로 앞선 예시처럼, `Array`의 참조 자체는 변경되었는데도, 더 깊게 위치한 `id`가 `3`인 todo 객체에 대한 참조는 변경되지 않을 수 있었습니다.

## 한계

사실, 앞선 로직은 데이터의 크기 자체가 클수록 점점 더 버거울 수 밖에 없습니다. `replaceEqualDeep` 함수가 재귀적으로 수행되며 깊은 프로퍼티에 대해 일일이 비교하기 때문에, 데이터의 크기가 커질수록 수행 시간이 기하급수적으로 늘어나기 때문입니다.

당연히, 이러한 로직의 수행을 원치 않는 경우를 위해 React Query 측 옵션에서도 이를 비활성화할 수 있도록 `structuralSharing` 옵션을 제공하고 있습니다. (앞서 말한 것처럼, 기본값은 `true`입니다.)

단순히 로직이 무거운 경우 외에도, 제가 경험했던 것처럼 **의도적으로** `refetch`에 따라 참조가 바뀌어야 하는 경우에도 이를 비활성화할 수 있습니다.

## 마치며

생각보다 React Query는 내부적으로 많은 일을 해주고 있었다는 생각이 듭니다. 일을 하면서 우연히 마주친 경험인데, 그 안에서 이런 점을 또 새로 알아볼 수 있어 유익했네요! :)
