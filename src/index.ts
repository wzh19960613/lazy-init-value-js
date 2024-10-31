class LazyInitValueBase<FN> {
    static autoFreeze = true

    protected _initFn?: FN
    protected _autoFreeze?: boolean

    constructor(initFn: FN, autoFreeze?: boolean) {
        this._initFn = initFn
        this._autoFreeze = autoFreeze ?? LazyInitValue.autoFreeze
    }

    get inited() { return this._initFn === undefined }

    reset(initFn: FN) { this._initFn = initFn }

    freeze() {
        if (Object.isFrozen(this)) return
        delete this._autoFreeze
        Object.freeze(this)
    }
}

export class LazyInitNull extends LazyInitValueBase<null> {
    static get autoFreeze() { return LazyInitValueBase.autoFreeze }
    static set autoFreeze(autoFreeze: boolean) { LazyInitValueBase.autoFreeze = autoFreeze }

    constructor(autoFreeze?: boolean) { super(null, autoFreeze) }

    init() {
        if (this.inited) return false
        delete this._initFn
        if (this._autoFreeze) this.freeze()
        return true
    }

    get value() { return this.init(), null }
}

export class LazyInitValue<T> extends LazyInitValueBase<() => T> {
    static get autoFreeze() { return LazyInitValueBase.autoFreeze }
    static set autoFreeze(autoFreeze: boolean) { LazyInitValueBase.autoFreeze = autoFreeze }

    #value?: T

    constructor(initFn: () => T, autoFreeze?: boolean) { super(initFn, autoFreeze) }

    init() {
        if (!this._initFn) return false
        this.#value = this._initFn()
        delete this._initFn
        if (this._autoFreeze) this.freeze()
        return true
    }

    get value() { return this.init(), this.#value as T }
}

export class LazyAsyncInitValue<T> extends LazyInitValueBase<() => Promise<T>> {
    static get autoFreeze() { return LazyInitValueBase.autoFreeze }
    static set autoFreeze(autoFreeze: boolean) { LazyInitValueBase.autoFreeze = autoFreeze }

    #value?: T

    constructor(initFn: () => Promise<T>, autoFreeze?: boolean) { super(initFn, autoFreeze) }

    get initing() { return this._initing || false }

    value() {
        if (!this._initFn) return this.#value as T
        return this._make_promise_and_init<T>()
    }

    init() {
        if (!this._initFn) return false
        return this._make_promise_and_init<true>(resolve => () => resolve(true))
    }

    get value_sync() {
        if (!this._initFn) return this.#value
        if (!this._initing) this._init_value()
    }

    protected _initing?: true
    protected _resolvers?: ((value: T) => void)[] = []
    protected _rejections?: ((reason: any) => void)[] = []

    protected _init_value() {
        this._initing = true
        this._initFn!().then(value => {
            this.#value = value
            delete this._initFn
            delete this._initing
            for (const res of this._resolvers ?? []) res(value)
            delete this._resolvers
            delete this._rejections
            if (this._autoFreeze) this.freeze()
        }).catch(reason => {
            delete this._initing
            for (const rej of this._rejections ?? []) rej(reason)
            delete this._resolvers
            delete this._rejections
        })
    }

    protected _make_promise_and_init<R>(fn?: (resolve: (value: R) => void) => (value: T) => void) {
        if (!this._resolvers) { this._resolvers = []; this._rejections = [] }
        return new Promise<R>((resolve, reject) => {
            this._resolvers!.push(fn ? fn(resolve) : resolve as unknown as (value: T) => void)
            this._rejections!.push(reject)
            if (!this._initing) this._init_value()
        })
    }
}