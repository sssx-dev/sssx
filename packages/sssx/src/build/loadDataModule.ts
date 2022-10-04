import Logger from '@sssx/logger';
import { config } from '@sssx/config';
import type { FilesMap } from '../types';
import { SEPARATOR } from '../constants.js';
import { importWithoutCache } from '../utils/importWithoutCache.js';
import type { PageFnGet, PageFnProps, PagePermalink } from '../types/Route.js';

const normalizeToSourcePath = async (input: string) => {
  return input
    .replace([config.distDir, config.ssrRoot].join(SEPARATOR), config.sourceRoot)
    .replace(`${SEPARATOR}index.js`, `${SEPARATOR}route.js`);
};

export const loadDataModule = async (template: string, filesMap: FilesMap) => {
  const sourcePath = await normalizeToSourcePath(template);
  Logger.verbose(`loadDataModule`, sourcePath);
  const dataFile = filesMap[sourcePath][0];
  Logger.verbose(`loadDataModule`, { sourcePath, dataFile });

  // const dataModule = await import(dataFile); // this calls are cached
  const dataModule = await importWithoutCache(dataFile); // this calls are cached
  const getAll: PageFnGet = dataModule.getAll;
  const getUpdates: PageFnGet = dataModule.getUpdates;
  const getRemovals: PageFnGet = dataModule.getRemovals;
  const getProps: PageFnProps = dataModule.getProps;
  const permalink: PagePermalink = dataModule.permalink;

  return {
    getAll,
    getUpdates,
    getRemovals,
    getProps,
    permalink
  };
};
