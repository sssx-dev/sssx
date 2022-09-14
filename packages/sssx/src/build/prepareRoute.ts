import { getPermalink } from './getPermalink.js';

import { loadDataModule } from './loadDataModule.js';
import { loadSSRModule } from './loadSSRModule.js';

import type { AbstractItem } from './loadDataModule.js';
import type { SSRModule } from './loadSSRModule';
import type { DataModule } from './loadDataModule.js';
import type { FilesMap } from '../types/index.js';
import { config, OUTDIR } from '../config/index.js';
import { SEPARATOR, DYNAMIC_NAME } from 'src/constants.js';

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

export const prepareRouteModules = async (template: string, filesMap: FilesMap) => {
  const [dataModule, ssrModule] = await Promise.all([
    loadDataModule(template, filesMap),
    loadSSRModule(template)
  ]);

  const modules: RouteModules = {
    data: dataModule,
    ssr: ssrModule
  };

  return modules;
};

type PrepareRouteMode = 'all' | 'updates' | 'removals';

export const prepareRoute = async (
  filesMap: FilesMap,
  template: string,
  modules: RouteModules,
  mode: PrepareRouteMode = 'all'
) => {
  let items: AbstractItem[] = [];

  if (mode === 'updates' && modules.data.getUpdates !== undefined)
    items = await modules.data.getUpdates();
  else if (mode === 'removals' && modules.data.getRemovals !== undefined)
    items = await modules.data.getRemovals();
  else if (mode === 'all') items = await modules.data.getAll();

  const routeName = template.split(SEPARATOR)[3];
  const array: ItemPathTemplate[] = items.map((item: AbstractItem) => {
    const path = getPermalink(routeName, item, modules.data.permalink, {
      relative: false,
      checkExistingRoutes: false
    });

    const dynamicPath = template
      .replace('index.js', `${DYNAMIC_NAME}.js`)
      .replace(`${config.distDir}/${config.ssrRoot}`, config.sourceRoot);

    const map = filesMap[dynamicPath];
    const dynamic = map ? map.slice(-1)[0].replace(OUTDIR, '') : undefined;

    return {
      item,
      path,
      template,
      routeName,
      dynamic
    };
  });

  return array;
};
