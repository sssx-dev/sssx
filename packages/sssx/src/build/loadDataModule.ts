import { config } from '../config/index.js';
import type { RoutePermalinkFn, RoutePropsFn } from '../types/Route.js';
import type { AbstractItem, FilesMap } from './types.js';

export type DataModule = Awaited<ReturnType<typeof loadDataModule>>;

const normalizeToSourcePath = async (input: string) => {
  return input
    .replace(`${config.distDir}/${config.ssrRoot}`, config.sourceRoot)
    .replace(`/index.js`, `/route.js`);
};

export const loadDataModule = async (template: string, filesMap: FilesMap) => {
  const sourcePath = await normalizeToSourcePath(template);
  // console.log(`loadDataModule`, sourcePath)
  const dataFile = filesMap[sourcePath][0];
  // console.log(`loadDataModule`, {sourcePath, dataFile})

  const dataModule = await import(dataFile);
  const getAll: (...args: unknown[]) => AbstractItem[] = dataModule.getAll;
  const getUpdates: (...args: unknown[]) => AbstractItem[] = dataModule.getUpdates;
  const getRemovals: (...args: unknown[]) => AbstractItem[] = dataModule.getRemovals;
  const getProps: RoutePropsFn<AbstractItem, unknown> = dataModule.getProps;
  const permalink: RoutePermalinkFn<AbstractItem> = dataModule.permalink;

  return {
    getAll,
    getUpdates,
    getRemovals,
    getProps,
    permalink
  };
};
