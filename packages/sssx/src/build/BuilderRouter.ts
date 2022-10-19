import glob from 'tiny-glob';
import { BuilderCompiler } from './BuilderCompiler.js';
import { config, GENERATED_ROUTES, PREFIX } from '@sssx/config';

import fs from '../lib/fs.js';
import Progress from '../cli/Progress.js';
import { prepareRoute, prepareRouteModules } from './prepareRoute.js';
import { NEWLINE, SEPARATOR } from '../constants.js';
import { difference, getTemplateRoute } from './helpers.js';
import { ensureDirExists } from '../utils/ensureDirExists.js';

import { defaultRenderOptions, type RenderOptions, type RouteModules } from '../types/index.js';
import type { Route } from '../types/Route.js';
import Logger from '@sssx/logger';

export class BuilderRouter extends BuilderCompiler {
  protected routeModules: Record<string, RouteModules> = {};
  protected addedRequests: Route[] = [];
  protected removedRequests: Route[] = [];

  protected previouslyGeneratedRoutes =
    fs.existsSync(PREFIX) && fs.existsSync(GENERATED_ROUTES)
      ? fs.readdirSync(GENERATED_ROUTES).map((txtFile) => txtFile.split(`.`)[0])
      : [];

  /**
   * Preload all existing SSR and Data modules
   */
  public prepareRoutes = async () => {
    const templates = await glob(this.ssrRoutesWildcard);
    this.ssrRouteTemplates = templates;

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const modules = await prepareRouteModules(template, this as never);
      this.routeModules[template] = modules;
    }
  };

  protected getRoutePaths = async (template: string) => {
    const modules = this.routeModules[template];
    const array = await prepareRoute(this.filesMap, template, modules, 'all');

    // helper function
    const transformPath = (input: string) =>
      input.replace([process.cwd(), config.outDir].join(SEPARATOR), ``).toLowerCase();

    const removedPaths = this.removedRequests.map((o) => o.path);

    const paths = array
      // filter out removals from this.removedRequests
      .filter((o) => !removedPaths.includes(o.path))
      .map((o) => JSON.stringify({ ...o, path: transformPath(o.path) }))
      .sort();

    // Logger.log('getRoutePaths', template, paths);
    // Logger.log('getRoutePaths[removedRequests]', template, this.removedRequests);

    // saving to file route-name.txt, as JSON per line
    const filename = getTemplateRoute(template) + `.txt`;
    ensureDirExists(GENERATED_ROUTES);
    await fs.writeFile(
      [GENERATED_ROUTES, filename].join(SEPARATOR),
      paths.sort().join(NEWLINE),
      'utf8'
    );
  };

  /**
   * stores all routes into .sssx/routes/<route_name>.txt
   * runs in parallel
   * @example template='.sssx/ssr/routes/blog/index.js'
   */
  public generateAllPaths = async () => {
    await this.generateRemovals();
    const templates = Object.keys(this.routeModules);
    await Promise.all(templates.map(this.getRoutePaths));
  };

  public generateRemovals = async () => {
    const allTemplates = Object.keys(this.routeModules);
    this.removedRequests = (
      await Promise.all(
        allTemplates.map((t) => prepareRoute(this.filesMap, t, this.routeModules[t], 'removals'))
      )
    ).flat();
  };

  /**
   * Generate requests using `getUpdates` in each route.
   *
   * In `updatesOnly` mode it will check if new routes were created, and will generate requests for each such route.
   *
   * @param routes ['*']
   * @param updatesOnly false
   */
  public generateRequests = async (renderOptions: RenderOptions = defaultRenderOptions) => {
    const options = Object.assign({}, defaultRenderOptions, renderOptions);
    const { routes, updatesOnly } = options;
    const paths = options.paths ? options.paths : [];

    const templates = Object.keys(this.routeModules);

    Logger.verbose(`generateRequests`, { templates, paths });

    // detecting if new route was added, and if we need to run `build` for newly created routes
    const existingRoutes = templates.map(getTemplateRoute);
    const previousRoutes = this.previouslyGeneratedRoutes;
    const diff = difference(existingRoutes, previousRoutes);

    const newTemplates = templates.filter((template) => diff.includes(getTemplateRoute(template)));

    const filteredTemplates = routes.includes('*')
      ? templates
      : templates.filter((path) => routes.includes(getTemplateRoute(path)));

    // TODO: DRY
    const requests = (
      await Promise.all(
        [
          newTemplates.map((template) =>
            prepareRoute(this.filesMap, template, this.routeModules[template], 'all')
          ),
          filteredTemplates.map((template) =>
            prepareRoute(
              this.filesMap,
              template,
              this.routeModules[template],
              updatesOnly ? 'updates' : 'all'
            )
          )
        ].flat()
      )
    ).flat();

    // filter paths
    this.addedRequests =
      paths.length > 0
        ? requests.filter((r) => paths.includes(r.path.split(config.outDir)[1]))
        : requests;
  };

  /**
   * In the incremental updates mode, some of the routes could become outdated
   * we call `processRemovals` to remove these folders
   */
  public processRemovals = async () => {
    const paths = this.removedRequests.map((r) => r.path).filter((path) => fs.existsSync(path));

    if (paths.length > 0) {
      const bar = Progress.createBar(
        'Removing old routes',
        paths.length,
        0,
        ' {percentage}% | {value}/{total} | {route}',
        { route: '' }
      );

      paths.map((dir, index) => {
        fs.rmSync(dir, { recursive: true });
        bar.update(index, { route: dir.replace(process.cwd(), '') });
      });

      bar.stop();
    }
  };

  protected getRouteModules = async (template: string) => {
    // await this.getRoutePaths(template);
    const { ssr, data } = this.routeModules[template];
    return { ssrModule: ssr, dataModule: data };
  };

  public getRequests = (type: 'added' | 'removed' = 'added') => {
    const requests = type === 'added' ? this.addedRequests : this.removedRequests;
    return requests.map(({ path, template }) => ({ path, template }));
  };
}
