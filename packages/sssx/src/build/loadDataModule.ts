import { config } from '../config/index.js';
import type { RouteParams, RoutePermalinkFn, RoutePropsFn } from '../types/Route.js';
import type { FilesMap } from '../types';

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
  const getAll: (...args: unknown[]) => RouteParams[] = dataModule.getAll;
  const getUpdates: (...args: unknown[]) => RouteParams[] = dataModule.getUpdates;
  const getRemovals: (...args: unknown[]) => RouteParams[] = dataModule.getRemovals;
  const getProps: RoutePropsFn<RouteParams, unknown> = dataModule.getProps;
  const permalink: RoutePermalinkFn<RouteParams> = dataModule.permalink;

  return {
    getAll,
    getUpdates,
    getRemovals,
    getProps,
    permalink
  };
};
