// from https://gist.github.com/chanced/bfc4f4bfdd60077f30d0e0b043c5f81f
export type SvelteComponentConstructorOptions<T> = T extends abstract new (
	opts: Svelte2TsxComponentConstructorParameters<infer P>,
) => any
	? Svelte2TsxComponentConstructorParameters<P>
	: never;

export type SvelteComponentProps<T> = T extends abstract new (
	opts: Svelte2TsxComponentConstructorParameters<infer P>,
) => any
	? Svelte2TsxComponentConstructorParameters<P>["props"]
	: never;