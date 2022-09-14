import type { SSRModule } from './loadSSRModule';
import type { DataModule } from './loadDataModule.js';

export type AbstractItem = unknown;

export type RouteModules = {
  data: DataModule;
  ssr: SSRModule;
};

export type ItemPathTemplate = {
  item: AbstractItem;
  path: string;
  template: string;
  routeName: string;
  dynamic?: string;
};

export type FilesMap = Record<string, string[]>;
export type PrepareRouteMode = 'all' | 'updates' | 'removals';
