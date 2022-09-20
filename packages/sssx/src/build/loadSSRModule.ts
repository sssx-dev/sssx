import path from 'path';
import type { create_ssr_component } from 'svelte/internal';
import type { VirtualComponentData } from '../types/svelteExtension.js';

type OriginalSSRModule = ReturnType<typeof create_ssr_component>;
export type HydratableComponentsFn = (...args: unknown[]) => VirtualComponentData[];

export type SSRModule = OriginalSSRModule & {
  getHydratableComponents: HydratableComponentsFn;
};

export const loadSSRModule = async (modulePath: string) => {
  // console.log(`loadSSRModule`, modulePath)
  const Module = await import(path.resolve(process.cwd(), modulePath));

  return Module.default as SSRModule;
};
