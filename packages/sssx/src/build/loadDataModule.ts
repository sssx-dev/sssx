import { config } from '@sssx/config';
import { SEPARATOR } from '../constants.js';
import { importWithoutCache } from '../utils/importWithoutCache.js';
import type { PageFnGet, Data, PagePermalink } from '../types/Route.js';
import type { Builder } from './index.js';

const normalizeToSourcePath = (input: string) => {
  const originRoot = [config.distDir, config.ssrRoot].join(SEPARATOR);

  return input
    .replace(originRoot, config.sourceRoot)
    .replace(`${SEPARATOR}index.js`, `${SEPARATOR}route.js`);
};

export const loadDataModule = async (template: string, builder: Builder) => {
  const sourcePath = normalizeToSourcePath(template);
  const dataFile = builder.getFileFromFilesMap(sourcePath);

  // const dataModule = await import(dataFile); // this calls are cached
  const dataModule = await importWithoutCache(dataFile); // this calls are cached
  const getAll: PageFnGet = dataModule.getAll;
  const getUpdates: PageFnGet = dataModule.getUpdates;
  const getRemovals: PageFnGet = dataModule.getRemovals;
  const getProps: (data: Data) => never = dataModule.getProps;
  const permalink: PagePermalink = dataModule.permalink;

  return {
    getAll,
    getUpdates,
    getRemovals,
    getProps,
    permalink
  };
};
