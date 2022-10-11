import { config } from '@sssx/config';
import { SEPARATOR } from '../constants.js';
import { importWithoutCache } from '../utils/importWithoutCache.js';
import type { PageRequests, PageData, PagePermalink, DataModule } from '../types/Route.js';
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

  // const module = await import(dataFile); // this calls are cached
  const module = await importWithoutCache(dataFile); // this calls are cached

  const all: PageRequests = module.all;
  const updates: PageRequests = module.updates;
  const removals: PageRequests = module.removals;
  const data: PageData = module.data;
  const permalink: PagePermalink = module.permalink;

  return {
    all,
    updates,
    removals,
    data,
    permalink
  } as DataModule;
};
