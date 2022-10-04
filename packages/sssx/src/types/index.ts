import type { SSRModule } from '../build/loadSSRModule';
import type { PageModule } from '../types/Route.js';

export type FilesMap = Record<string, string[]>;
export type PrepareRouteMode = 'all' | 'updates' | 'removals';

export type RouteModules = {
  data: PageModule;
  ssr: SSRModule;
};
