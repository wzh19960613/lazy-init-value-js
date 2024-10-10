# lazy-init-value

A library for lazy initialization of values, supporting both synchronous and asynchronous scenarios.

## Features

- Lazy initialization of synchronous values and asynchronous values
- Reset functionality
- Ability to check initialization status

## Installation

```bash
npm install lazy-init-value
```

## Usage

```javascript
import { LazyInitValue } from 'lazy-init-value';

const value = new LazyInitValue(() => {
    console.log('Initializing...');
    return 42;
});

console.log(value.value); // Logs: "Initializing..." then "42"
console.log(value.value); // "42" (doesn't reinitialize)

import { LazyAsyncInitValue } from 'lazy-init-value';

const asyncValue = new LazyAsyncInitValue(async () => {
    console.log('Initializing...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'Async Result';
});

console.log(await asyncValue.value()); // Logs: "Initializing..." then "Async Result"
console.log(await asyncValue.value()); // "Async Result" (doesn't reinitialize)
```

## About Freezing

You can freeze a value by calling `freeze()` method, then it cannot be `reset(...)`.

When a value is set to be `autoFreeze`, it will be frozen after initialization.

There is a static `autoFreeze` property defaulting to `true` in `LazyInitValue`, 
`LazyAsyncInitValue` and `LazyInitValueBase` to control whether the following values will be frozen
automatically after initialized. These three are binded to the same value.

And you can also control `autoFreeze` for each instance when creating it:

```javascript
import { LazyInitValue } from 'lazy-init-value';

const value1 = new LazyInitValue(() => 42, true); // will be auto-frozen, default
const value2 = new LazyInitValue(() => 42, false); // will not be frozen, can `reset(...)` later

value2.reset(() => 43);
console.log(value2.value); // 43

value2.freeze();
try {
    value2.reset(() => 44);
} catch (e) {
    console.log(e); // Cannot reset value after `freeze()`
}

console.log(LazyInitValue.autoFreeze); // true, default
const value3 = new LazyInitValue(() => 42); // will be auto-frozen

LazyInitValue.autoFreeze = false;
const value4 = new LazyInitValue(() => 42); // will not be frozen

import { LazyAsyncInitValue } from 'lazy-init-value';
console.log(LazyAsyncInitValue.autoFreeze); // false, same as `LazyInitValueBase.autoFreeze`
```

## API

### For Both `LazyInitValue` and `LazyAsyncInitValue`

- `inited: boolean` - Check if the value has been initialized
- `freeze()` - Then it cannot be `reset`

### `LazyInitValue<T>(initFn: () => T, autoFreeze?: boolean)`

- `value: T` - Get the lazily initialized value
- `reset(initFn: () => T)` - Reset the initialization function

### `LazyAsyncInitValue<T>(initFn: () => Promise<T>, autoFreeze?: boolean)`

- `value(): Promise<T> | T` - Get the value or a promise resolves to the lazily initialized value
- `value_sync: T | undefined` - Get the initialized value or trigger initialization
- `initing: boolean` - Check if async initialization is in progress
- `reset(initFn: () => Promise<T>)` - Reset the initialization function

So here is a tip when using `LazyAsyncInitValue`:

- Use `await obj.value()` to get the value when you are not sure whether the value is initialized.  
  There is no need to worry about the timing of initialization.
- Use `obj.value_sync` to get the value when you ensure the value is already initialized. It's faster.

## License

This project is licensed under the MIT License.