# lazy-init-value

English | [中文](README_CN.md)

A library for lazy initialization of values, supporting both synchronous and asynchronous scenarios.

## Installation

```bash
npm i lazy-init-value
```

## Usage

```javascript
import { LazyInitValue } from 'lazy-init-value'

const value = new LazyInitValue(() => {
    console.log('Initializing...')
    return 42
})

console.log(value.value) // Outputs: "Initializing..." then "42"
console.log(value.value) // "42" (won't reinitialize)

import { LazyAsyncInitValue } from 'lazy-init-value'

const asyncValue = new LazyAsyncInitValue(async () => {
    console.log('Initializing...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    return 'Async result'
})

console.log(await asyncValue.value()) // Outputs: "Initializing..." then "Async result"
console.log(await asyncValue.value()) // "Async result" (won't reinitialize)
```

## About Freezing

Freeze a value by calling the `freeze()` method, after which it cannot be `reset(...)`.

`LazyInitValue` and `LazyAsyncInitValue` are set to `autoFreeze` by default when constructed, which automatically freezes after initialization.

`LazyInitValue`, `LazyAsyncInitValue`, and `LazyInitValueBase` all have a static `autoFreeze` property, defaulting to `true`, which controls whether subsequent constructor calls automatically freeze by default. These three properties are bound to the same value, modifying any of them will affect all.

Can also control `autoFreeze` when creating each instance.

```javascript
import { LazyInitValue } from 'lazy-init-value'

const value1 = new LazyInitValue(() => 42, true)  // Will auto-freeze, default behavior
const value2 = new LazyInitValue(() => 42, false) // Won't be frozen, can be `reset(...)` later

value2.reset(() => 43)
console.log(value2.value) // 43

value2.freeze()

try {
    value2.reset(() => 44)
} catch (e) {
    console.log(e)                         // Can't reset value after `freeze()`
}

console.log(LazyInitValue.autoFreeze)      // true, default value
const value3 = new LazyInitValue(() => 42) // Will auto-freeze

LazyInitValue.autoFreeze = false
const value4 = new LazyInitValue(() => 42) // Won't be frozen

import { LazyAsyncInitValue } from 'lazy-init-value'

console.log(LazyAsyncInitValue.autoFreeze) // false, same as `LazyInitValueBase.autoFreeze`
```

## API

### `LazyInitValue<T>(initFn: () => T, autoFreeze?: boolean)`

- `inited: boolean` - Check if the value has been initialized
- `freeze()` - Freeze the value, cannot `reset` afterwards
- `value: T` - Get the lazy-initialized value
- `reset(initFn: () => T)` - Reset the initialization function

### `LazyAsyncInitValue<T>(initFn: () => Promise<T>, autoFreeze?: boolean)`

- `inited: boolean` - Check if the value has been initialized
- `freeze()` - Freeze the value, cannot `reset` afterwards
- `value(): Promise<T> | T` - Get the value or a Promise that resolves to the lazy-initialized value
- `value_sync: T | undefined` - Get the initialized value or trigger initialization
- `initing: boolean` - Check if async initialization is in progress
- `reset(initFn: () => Promise<T>)` - Reset the initialization function

Usage tips for `LazyAsyncInitValue`:

- When unsure if the value has been initialized, use `await obj.value()` to get the value and don't need to worry about the timing of initialization
- When certain that the value has been initialized, use `obj.value_sync` to get the value. This is more performant
