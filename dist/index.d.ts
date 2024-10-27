export declare class LazyInitValueBase<T, INIT_FN> {
	static autoFreeze: boolean
	protected _value?: T
	protected _initFn?: INIT_FN
	protected _autoFreeze?: boolean
	constructor(initFn: INIT_FN, autoFreeze?: boolean)
	get inited(): boolean
	reset(initFn: INIT_FN): void
	freeze(): void
}
export declare class LazyInitValue<T> extends LazyInitValueBase<T, () => T> {
	static get autoFreeze(): boolean
	static set autoFreeze(autoFreeze: boolean)
	constructor(initFn: () => T, autoFreeze?: boolean)
	get value(): T
}
export declare class LazyAsyncInitValue<T> extends LazyInitValueBase<T, () => Promise<T>> {
	static get autoFreeze(): boolean
	static set autoFreeze(autoFreeze: boolean)
	protected _initing?: true
	protected _resolvers?: ((value: T) => void)[]
	protected _rejections?: ((reason: any) => void)[]
	constructor(initFn: () => Promise<T>, autoFreeze?: boolean)
	get initing(): boolean
	_init_value(): void
	value(): T | Promise<T>
	get value_sync(): T | undefined
}

export { }
