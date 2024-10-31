import { expect, test, describe } from "bun:test"
import { LazyInitValue, LazyAsyncInitValue, LazyInitNull } from './index'

describe('LazyInitValue', () => {
    test('should delay initialization of value', () => {
        let initialized = false
        const lazyValue = new LazyInitValue(() => {
            initialized = true
            return 42
        })

        expect(initialized).toBe(false)
        expect(lazyValue.inited).toBe(false)

        const value = lazyValue.value

        expect(initialized).toBe(true)
        expect(lazyValue.inited).toBe(true)
        expect(value).toBe(42)
    })

    test('should allow resetting the initialization function', () => {
        const lazyValue = new LazyInitValue(() => 1, false)
        expect(lazyValue.value).toBe(1)

        lazyValue.reset(() => 2)
        expect(lazyValue.inited).toBe(false)
        expect(lazyValue.value).toBe(2)
    })

    test('should freeze object after initialization (when autoFreeze is true)', () => {
        LazyInitValue.autoFreeze = true
        const lazyValue = new LazyInitValue(() => 42)
        lazyValue.value
        expect(Object.isFrozen(lazyValue)).toBe(true)
    })

    test('should not freeze object after initialization (when autoFreeze is false)', () => {
        LazyInitValue.autoFreeze = false
        const lazyValue = new LazyInitValue(() => 42)
        lazyValue.value
        expect(Object.isFrozen(lazyValue)).toBe(false)
    })

    test('would not throw when freeze a frozen object', () => {
        const lazyValue = new LazyInitValue(() => 42, true)
        lazyValue.value
        expect(Object.isFrozen(lazyValue)).toBe(true)
        expect(() => lazyValue.freeze()).not.toThrow()
        expect(Object.isFrozen(lazyValue)).toBe(true)
    })

    test('throw when reset a frozen object', () => {
        const lazyValue = new LazyInitValue(() => 42, true)
        lazyValue.value
        expect(Object.isFrozen(lazyValue)).toBe(true)
        expect(() => lazyValue.reset(() => 42)).toThrow()
        expect(Object.isFrozen(lazyValue)).toBe(true)
    })

    test('init() should return true on first call and false afterwards', () => {
        let initialized = false
        const lazyValue = new LazyInitValue(() => {
            initialized = true
            return 42
        })

        expect(initialized).toBe(false)
        expect(lazyValue.init()).toBe(true)
        expect(initialized).toBe(true)
        expect(lazyValue.init()).toBe(false)
    })

    test('init() should initialize the value without accessing value property', () => {
        let initialized = false
        const lazyValue = new LazyInitValue(() => {
            initialized = true
            return 42
        })

        expect(initialized).toBe(false)
        lazyValue.init()
        expect(initialized).toBe(true)
        expect(lazyValue.value).toBe(42)
    })
})

describe('LazyAsyncInitValue', () => {
    test('should delay asynchronous initialization of value', async () => {
        let initialized = false
        const lazyAsyncValue = new LazyAsyncInitValue(async () => {
            await new Promise(resolve => setTimeout(resolve, 10))
            initialized = true
            return 42
        })

        expect(initialized).toBe(false)
        expect(lazyAsyncValue.inited).toBe(false)
        expect(lazyAsyncValue.initing).toBe(false)

        const valuePromise = lazyAsyncValue.value()
        expect(lazyAsyncValue.initing).toBe(true)

        const value = await valuePromise

        expect(initialized).toBe(true)
        expect(lazyAsyncValue.inited).toBe(true)
        expect(lazyAsyncValue.initing).toBe(false)
        expect(value).toBe(42)
        expect(lazyAsyncValue.value_sync).toBe(42)
        expect(typeof lazyAsyncValue.value()).toBe('number')
        expect(await lazyAsyncValue.value()).toBe(42)
    })

    test('should allow resetting the asynchronous initialization function', async () => {
        const lazyAsyncValue = new LazyAsyncInitValue(async () => 1, false)
        expect(await lazyAsyncValue.value()).toBe(1)

        lazyAsyncValue.reset(async () => 2)
        expect(lazyAsyncValue.inited).toBe(false)
        expect(await lazyAsyncValue.value()).toBe(2)
    })

    test('should freeze object after asynchronous initialization (when autoFreeze is true)', async () => {
        LazyAsyncInitValue.autoFreeze = true
        const lazyAsyncValue = new LazyAsyncInitValue(async () => 42)
        await lazyAsyncValue.value()
        expect(Object.isFrozen(lazyAsyncValue)).toBe(true)
    })

    test('should correctly handle value_sync property', () => {
        const lazyAsyncValue = new LazyAsyncInitValue(async () => 42)
        expect(lazyAsyncValue.value_sync).toBeUndefined()
        expect(lazyAsyncValue.initing).toBe(true)
    })

    test('init() should return Promise<true> on first call and Promise<false> afterwards', async () => {
        let initialized = false
        const lazyAsyncValue = new LazyAsyncInitValue(async () => {
            await new Promise(resolve => setTimeout(resolve, 10))
            initialized = true
            return 42
        })

        expect(initialized).toBe(false)
        expect(await lazyAsyncValue.init()).toBe(true)
        expect(initialized).toBe(true)
        expect(await lazyAsyncValue.init()).toBe(false)
    })

    test('init() should initialize the value without accessing value()', async () => {
        let initialized = false
        const lazyAsyncValue = new LazyAsyncInitValue(async () => {
            await new Promise(resolve => setTimeout(resolve, 10))
            initialized = true
            return 42
        })

        expect(initialized).toBe(false)
        await lazyAsyncValue.init()
        expect(initialized).toBe(true)
        expect(await lazyAsyncValue.value()).toBe(42)
    })

    test('multiple concurrent init() calls should resolve to same value', async () => {
        let initCount = 0
        const lazyAsyncValue = new LazyAsyncInitValue(async () => {
            await new Promise(resolve => setTimeout(resolve, 10))
            initCount++
            return 42
        })

        const results = await Promise.all([
            lazyAsyncValue.init(),
            lazyAsyncValue.init(),
            lazyAsyncValue.init()
        ])

        expect(results).toEqual([true, true, true])
        expect(initCount).toBe(1)
        expect(await lazyAsyncValue.value()).toBe(42)
    })
})

describe('LazyInitNull', () => {
    test('should initialize to null', () => {
        const lazyNull = new LazyInitNull()
        expect(lazyNull.inited).toBe(false)
        expect(lazyNull.value).toBe(null)
        expect(lazyNull.inited).toBe(true)
    })

    test('init() should return true on first call and false afterwards', () => {
        const lazyNull = new LazyInitNull()
        expect(lazyNull.init()).toBe(true)
        expect(lazyNull.init()).toBe(false)
    })

    test('should freeze object after initialization (when autoFreeze is true)', () => {
        LazyInitNull.autoFreeze = true
        const lazyNull = new LazyInitNull()
        lazyNull.init()
        expect(Object.isFrozen(lazyNull)).toBe(true)
    })

    test('should not freeze object after initialization (when autoFreeze is false)', () => {
        LazyInitNull.autoFreeze = false
        const lazyNull = new LazyInitNull()
        lazyNull.init()
        expect(Object.isFrozen(lazyNull)).toBe(false)
    })
})
