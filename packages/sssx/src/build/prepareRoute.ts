import { getPermalink } from './getPermalink.js';
import { loadDataModule } from './loadDataModule.js';
import { loadSSRModule } from './loadSSRModule.js';
import { config, OUTDIR } from '../config/index.js';
import { SEPARATOR, DYNAMIC_NAME } from '../constants.js';
import type { RouteModules, FilesMap, PrepareRouteMode } from '../types';
import type { Request, RouteParams } from '../types/Route.js';

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

const getDynamicPath = (template: string) => {
  return template
    .replace('index.js', `${DYNAMIC_NAME}.js`)
    .replace([config.distDir, config.ssrRoot].join(SEPARATOR), config.sourceRoot);
};

export const prepareRoute = async (
  filesMap: FilesMap,
  template: string,
  modules: RouteModules,
  mode: PrepareRouteMode = 'all'
) => {
  let items: RouteParams[] = [];

  if (mode === 'updates' && modules.data.getUpdates !== undefined) {
    items = await modules.data.getUpdates();
  } else if (mode === 'removals' && modules.data.getRemovals !== undefined) {
    items = await modules.data.getRemovals();
  } else if (mode === 'all' && modules.data.getAll !== undefined) {
    items = await modules.data.getAll();
  }

  const routeName = template.split(SEPARATOR)[3];
  const array: Request[] = items.map((item: RouteParams) => {
    const path = getPermalink(routeName, item as never, modules.data.permalink, {
      relative: false,
      checkExistingRoutes: false
    });

    const dynamicPath = getDynamicPath(template);
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
