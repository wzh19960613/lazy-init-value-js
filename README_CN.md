# lazy-init-value

[English](README.md) | 中文

一个用于延迟初始化值的库，支持同步和异步场景。

## 安装

```bash
npm i lazy-init-value
```

## 使用方法

```javascript
import { LazyInitValue } from 'lazy-init-value'

const value = new LazyInitValue(() => {
    console.log('正在初始化...')
    return 42
})

console.log(value.value) // 输出: "正在初始化..." 然后 "42"
console.log(value.value) // "42" (不会重新初始化)

import { LazyAsyncInitValue } from 'lazy-init-value'

const asyncValue = new LazyAsyncInitValue(async () => {
    console.log('正在初始化...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    return '异步结果'
})

console.log(await asyncValue.value()) // 输出: "正在初始化..." 然后 "异步结果"
console.log(await asyncValue.value()) // "异步结果" (不会重新初始化)

import { LazyInitNull } from 'lazy-init-value'

const nullValue = new LazyInitNull(false) // 避免自动冻结
console.log(nullValue.inited) // false
nullValue.init()
console.log(nullValue.inited) // true
nullValue.reset()
console.log(nullValue.inited) // false
```

## 关于冻结

可以通过调用`freeze()`方法来冻结一个值，这样之后它就不能再被`reset(...)`。

`LazyInitValue` 和 `LazyAsyncInitValue` 在构造时默认被设置为 `autoFreeze`，会在初始化后自动冻结。

`LazyInitValue`、`LazyAsyncInitValue`和`LazyInitNull`都有一个静态的`autoFreeze`属性，默认为`true`，用于控制后续调用构造函数时是否默认自动冻结。这三个属性绑定到同一个值，修改其中任意一个即可。

也可以在创建每个实例时控制`autoFreeze`。

```javascript
import { LazyInitValue } from 'lazy-init-value'

const value1 = new LazyInitValue(() => 42, true)  // 将自动冻结，默认行为
const value2 = new LazyInitValue(() => 42, false) // 不会被冻结，之后可以`reset(...)`

value2.reset(() => 43)
console.log(value2.value) // 43

value2.freeze()

try {
    value2.reset(() => 44)
} catch (e) {
    console.log(e)                         // 在 `freeze()` 后不能重置值
}

console.log(LazyInitValue.autoFreeze)      // true，默认值
const value3 = new LazyInitValue(() => 42) // 将自动冻结

LazyInitValue.autoFreeze = false
const value4 = new LazyInitValue(() => 42) // 不会被冻结

import { LazyAsyncInitValue } from 'lazy-init-value'

console.log(LazyAsyncInitValue.autoFreeze) // false，与`LazyInitValue.autoFreeze`相同
```

## API

### `LazyInitValue<T>(initFn: () => T, autoFreeze?: boolean)`

- `inited: boolean` - 检查值是否已被初始化
- `freeze()` - 冻结值，之后不能`reset`
- `value: T` - 如果已经初始化则返回值；如果未初始化则触发初始化并返回值
- `init(): boolean` - 尝试初始化。如果此时触发初始化则返回`true`；如果已经初始化过则返回`false`，并且不会重新初始化
- `reset(initFn: () => T)` - 重置为未初始化状态，并设置新的初始化函数

### `LazyAsyncInitValue<T>(initFn: () => Promise<T>, autoFreeze?: boolean)`

- `inited: boolean` - 检查值是否已被初始化
- `freeze()` - 冻结值，之后不能`reset`
- `value(): Promise<T> | T` - 如果已经初始化则返回值；如果未初始化则返回一个`Promise<T>`
- `value_sync: T | undefined` - 如果已经初始化则返回值；如果未初始化则触发初始化并返回`undefined`
- `init(): false | Promise<true>` - 尝试初始化。如果此时触发初始化则返回`Promise<true>`；如果已经初始化过则返回`false`，并且不会重新初始化
- `initing: boolean` - 检查异步初始化是否正在进行
- `reset(initFn: () => Promise<T>)` - 重置为未初始化状态，并设置新的初始化函数

`LazyAsyncInitValue` 使用提示:

- 当不确定值是否已初始化时，使用`await obj.value()`来获取值。这样不需要担心初始化的时机
- 当能确定值已经初始化时，使用`obj.value_sync`来获取值。这样性能更佳

### `LazyInitNull(autoFreeze?: boolean)`

一个特殊的延迟初始化类，始终初始化为 `null`。一般用 `init()` 手动初始化，再用 `inited` 属性来确定是否已经初始化。

- `inited: boolean` - 检查值是否已被初始化
- `freeze()` - 冻结值，之后不能`reset`
- `value: null` - 获取null值（如果尚未初始化则触发初始化）
- `init(): boolean` - 尝试初始化。如果此时触发初始化则返回`true`；如果已经初始化过则返回`false`，并且不会重新初始化
- `reset()` - 重置为未初始化状态
