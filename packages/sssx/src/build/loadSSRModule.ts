import path from 'path';
import Logger from '@sssx/logger';
import { importWithoutCache } from '../utils/importWithoutCache.js';

import type { create_ssr_component } from 'svelte/internal';
import type { VirtualComponentData } from '../types/svelteExtension.js';

type OriginalSSRModule = ReturnType<typeof create_ssr_component>;
export type HydratableComponentsFn = (...args: unknown[]) => VirtualComponentData[];

export type SSRModule = OriginalSSRModule & {
  getHydratableComponents: HydratableComponentsFn;
};

export const loadSSRModule = async (modulePath: string) => {
  Logger.verbose(`loadSSRModule`, modulePath);
  const absolutePath = path.resolve(process.cwd(), modulePath);
  // const Module = await import(absolutePath);
  const Module = await importWithoutCache(absolutePath);

  return Module.default as SSRModule;
};
