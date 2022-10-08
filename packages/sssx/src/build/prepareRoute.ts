import { getPermalink } from './getPermalink.js';
import { loadDataModule } from './loadDataModule.js';
import { loadSSRModule } from './loadSSRModule.js';
import { config, OUTDIR } from '@sssx/config';
import { SEPARATOR, DYNAMIC_NAME } from '../constants.js';
import type { RouteModules, FilesMap, PrepareRouteMode } from '../types';
import type { Request, Data } from '../types/Route.js';
import type { Builder } from './index.js';

export const prepareRouteModules = async (template: string, builder: Builder) => {
  const [dataModule, ssrModule] = await Promise.all([
    loadDataModule(template, builder),
    loadSSRModule(template)
  ]);

  const modules: RouteModules = {
    data: dataModule,
    ssr: ssrModule
  };

  return modules;
};

const getDynamicPath = (template: string) => {
  const dirSSR = [config.distDir, config.ssrRoot].join(SEPARATOR);
  return template.replace('index.js', `${DYNAMIC_NAME}.js`).replace(dirSSR, config.sourceRoot);
};

export const prepareRoute = async (
  filesMap: FilesMap,
  template: string,
  modules: RouteModules,
  mode: PrepareRouteMode = 'all'
) => {
  let all: Data[] = [];

  if (mode === 'updates' && modules.data.getUpdates !== undefined) {
    all = await modules.data.getUpdates();
  } else if (mode === 'removals' && modules.data.getRemovals !== undefined) {
    all = await modules.data.getRemovals();
  } else if (mode === 'all' && modules.data.getAll !== undefined) {
    all = await modules.data.getAll();
  }

  const routeName = template.split(SEPARATOR)[3];
  const array: Request[] = all.map((data: Data) => {
    const path = getPermalink(routeName, data, modules.data.permalink, {
      relative: false,
      checkExistingRoutes: false
    });

    const dynamicPath = getDynamicPath(template);
    const map = filesMap[dynamicPath];
    const dynamic = map ? map.slice(-1)[0].replace(OUTDIR, '') : undefined;

    return {
      data,
      path,
      template,
      routeName,
      dynamic
    };
  });

  return array;
};
