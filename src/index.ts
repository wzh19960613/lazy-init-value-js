export class LazyInitValueBase<T, INIT_FN> {
    static autoFreeze = true

    protected _value?: T
    protected _initFn?: INIT_FN
    protected _autoFreeze?: boolean

    constructor(initFn: INIT_FN, autoFreeze?: boolean) {
        this._initFn = initFn
        this._autoFreeze = autoFreeze ?? LazyInitValue.autoFreeze
    }

    get inited() { return !this._initFn }

    reset(initFn: INIT_FN) { this._initFn = initFn }

    freeze() {
        if (Object.isFrozen(this)) return
        delete this._autoFreeze
        Object.freeze(this)
    }
}

export class LazyInitValue<T> extends LazyInitValueBase<T, () => T> {
    static get autoFreeze() { return LazyInitValueBase.autoFreeze }
    static set autoFreeze(autoFreeze: boolean) { LazyInitValueBase.autoFreeze = autoFreeze }

    constructor(initFn: () => T, autoFreeze?: boolean) { super(initFn, autoFreeze) }

    get value() {
        if (!this._initFn) return this._value as T
        this._value = this._initFn()
        delete this._initFn
        if (this._autoFreeze) this.freeze()
        return this._value
    }
}

export class LazyAsyncInitValue<T> extends LazyInitValueBase<T, () => Promise<T>> {
    static get autoFreeze() { return LazyInitValueBase.autoFreeze }
    static set autoFreeze(autoFreeze: boolean) { LazyInitValueBase.autoFreeze = autoFreeze }

    protected _initing?: true
    protected _resolvers?: ((value: T) => void)[] = []
    protected _rejections?: ((reason: any) => void)[] = []

    constructor(initFn: () => Promise<T>, autoFreeze?: boolean) { super(initFn, autoFreeze) }

    get initing() { return this._initing ?? false }

    _init_value() {
        this._initing = true
        this._initFn!().then(value => {
            this._value = value
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

    value() {
        if (!this._initFn) return this._value as T
        if (!this._resolvers) {
            this._resolvers = []
            this._rejections = []
        }
        const promise = new Promise<T>((resolve, reject) => {
            this._resolvers!.push(resolve)
            this._rejections!.push(reject)
        })
        if (!this._initing) this._init_value()
        return promise
    }

    get value_sync() {
        if (!this._initFn) return this._value
        if (!this._initing) this._init_value()
    }
}