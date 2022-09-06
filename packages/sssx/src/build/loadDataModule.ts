import fs from '../lib/fs.js';
import path from 'path';
import { config } from '../config/index.js';
import type { FilesMap } from '../types/index.js';
import type { RoutePermalinkFn, RoutePropsFn } from '../types/Route.js';

export type AbstractItem = any;
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
  const getAll: (...args: any[]) => AbstractItem = dataModule.getAll;
  const getUpdates: (...args: any[]) => AbstractItem = dataModule.getUpdates;
  const getRemovals: (...args: any[]) => AbstractItem = dataModule.getRemovals;
  const getProps: RoutePropsFn<AbstractItem, any> = dataModule.getProps;
  const permalink: RoutePermalinkFn<AbstractItem> = dataModule.permalink;

  return {
    getAll,
    getUpdates,
    getRemovals,
    getProps,
    permalink
  };
};
