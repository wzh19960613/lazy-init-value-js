declare class LazyInitValueBase<FN> {
	static autoFreeze: boolean
	protected _initFn?: FN
	protected _autoFreeze?: boolean
	constructor(initFn: FN, autoFreeze?: boolean)
	get inited(): boolean
	reset(initFn: FN): void
	freeze(): void
}
export declare class LazyInitNull extends LazyInitValueBase<null> {
	static get autoFreeze(): boolean
	static set autoFreeze(autoFreeze: boolean)
	constructor(autoFreeze?: boolean)
	init(): boolean
	get value(): null
}
export declare class LazyInitValue<T> extends LazyInitValueBase<() => T> {
	#private
	static get autoFreeze(): boolean
	static set autoFreeze(autoFreeze: boolean)
	constructor(initFn: () => T, autoFreeze?: boolean)
	init(): boolean
	get value(): T
}
export declare class LazyAsyncInitValue<T> extends LazyInitValueBase<() => Promise<T>> {
	#private
	static get autoFreeze(): boolean
	static set autoFreeze(autoFreeze: boolean)
	constructor(initFn: () => Promise<T>, autoFreeze?: boolean)
	get initing(): boolean
	value(): T | Promise<T>
	init(): false | Promise<true>
	get value_sync(): T | undefined
	protected _initing?: true
	protected _resolvers?: ((value: T) => void)[]
	protected _rejections?: ((reason: any) => void)[]
	protected _init_value(): void
	protected _make_promise_and_init<R>(fn?: (resolve: (value: R) => void) => (value: T) => void): Promise<R>
}

export { }
