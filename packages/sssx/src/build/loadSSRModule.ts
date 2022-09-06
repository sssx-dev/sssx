import type { create_ssr_component } from 'svelte/internal';
import type { VirtualComponentData } from '../types/svelteExtension.js';

type OriginalSSRModule = ReturnType<typeof create_ssr_component>;
export type HydratableComponentsFn = (...args: any[]) => VirtualComponentData[];

export type SSRModule = OriginalSSRModule & {
  getHydratableComponents: HydratableComponentsFn;
};

export const loadSSRModule = async (path: string) => {
  // console.log(`loadSSRModule`, path)
  path = `${process.cwd()}/${path}`;
  const Module = await import(path);

  return Module.default as SSRModule;
};
