import type { SSRModule } from '../build/loadSSRModule';
import type { DataModule } from '../build/loadDataModule.js';

export type FilesMap = Record<string, string[]>;
export type PrepareRouteMode = 'all' | 'updates' | 'removals';

export type RouteModules = {
  data: DataModule;
  ssr: SSRModule;
};
