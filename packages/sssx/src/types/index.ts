import type { SSRModule } from '../build/loadSSRModule';
import type { DataModule } from '../types/Route.js';

export type FilesMap = Record<string, string[]>;
export type PrepareRouteMode = 'all' | 'updates' | 'removals';

export type RouteModules = {
  data: DataModule;
  ssr: SSRModule;
};

export type RenderOptions = {
  routes: string[];
  paths?: string[];
  /** each route will call updates() function */
  updatesOnly?: boolean;
};

export const defaultRenderOptions: RenderOptions = {
  routes: [`*`],
  paths: [],
  updatesOnly: false
};
