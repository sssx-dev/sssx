import path from 'path';
import chalk from 'chalk';
import glob from 'tiny-glob';
import Logger from '@sssx/logger';
import { fileURLToPath } from 'url';
import workerpool from 'workerpool';
import { customAlphabet } from 'nanoid/non-secure';
import { config, PREFIX, OUTDIR_SSSX, GENERATED_ROUTES, OUTDIR } from '@sssx/config';

import fs from '../lib/fs.js';
import Progress from '../cli/Progress.js';
import { buildSvelte } from './buildSvelte.js';
import { compileHTML } from './compileHTML.js';
import { sliceArray } from '../utils/sliceArray.js';
import { buildTypeScript } from './buildTypeScript.js';
import { buildSvelteCore } from './buildSvelteCore.js';
import { processCSSFiles } from './processCSSFiles.js';
import { isProduction, isDev } from '../utils/isDev.js';
import { difference, getTemplateRoute } from './helpers.js';
import { replaceImports } from '../plugins/replaceImports.js';
import { ensureDirExists } from '../utils/ensureDirExists.js';
import { prepareRoute, prepareRouteModules } from './prepareRoute.js';
import { SEPARATOR, DYNAMIC_NAME, SVELTEJS, NEWLINE } from '../constants.js';

import type { Request } from '../types/Route.js';
import type { FilesMap, RouteModules } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nanoid = customAlphabet(`0123456789abcdef`, 5);

type Options = {
  isWorker: boolean;
  isDry: boolean;
};

const defaultOptions: Options = {
  isWorker: false,
  isDry: false
};

type RenderOptions = {
  routes: string[];
  updatesOnly?: boolean;
};

const defaultRenderOptions: RenderOptions = {
  routes: [`*`]
};

export class Builder {
  private id: string;
  private svelteLib = `${__dirname}/../patches/${SVELTEJS}`;

  private svelteWildcard = `${process.cwd()}/${config.sourceRoot}/**/*.svelte`;
  private typescriptWildcard = `${process.cwd()}/${config.sourceRoot}/**/*.ts`;
  private cssWildcard = `${process.cwd()}/${config.sourceRoot}/**/*.css`;

  private compiledWildcard = `${PREFIX}/${config.compiledRoot}/**/*.js`;
  private componentsWildcard = `${PREFIX}/${config.compiledRoot}/components/**/*.js`;
  private routesWildcard = `${PREFIX}/${config.compiledRoot}/routes/**/*.js`;
  private routesDynamicWildcard = `${PREFIX}/${config.compiledRoot}/routes/**/*-dynamic-*.js`;
  private ssrRoutesWildcard = `${PREFIX}/${config.ssrRoot}/${config.routesPath}/**/*.js`;

  private ssrRouteTemplates: string[] = [];
  private routeModules: Record<string, RouteModules> = {};
  private addedRequests: Request[] = [];
  private removedRequests: Request[] = [];

  private filesMap: FilesMap = {};
  private isWorker;

  public readonly config = config;
  public readonly outdir = OUTDIR;

  constructor(options: Partial<Options> = defaultOptions) {
    this.id = nanoid();
    options = Object.assign({}, defaultOptions, options);
    this.isWorker = options.isWorker;
    Logger.verbose(`Creating new SSSX Builder`);
  }

  private prepareSvelteCore = async () => {
    const hashedSvelteCorePath = await buildSvelteCore([this.svelteLib], OUTDIR_SSSX);
    this.filesMap[SVELTEJS] = [hashedSvelteCorePath];

    const filename = hashedSvelteCorePath.split(`/`).pop() || '';
    const dst = path.resolve(PREFIX, config.compiledRoot);
    ensureDirExists(dst);

    const svelteCorePath = path.resolve(dst, filename);
    await fs.copyFile(this.svelteLib, svelteCorePath);
  };

  private setFilesMap = (key: string, value: string) => {
    if (!this.filesMap[key]) this.filesMap[key] = [];
    this.filesMap[key].push(value);
  };

  /**
   * Compiles source code from svelte and typescript to javascript, creates SSR version for each route,
   * and client side compiled version of everything else:
   * - components
   * - dynamic scripts
   */
  public setup = async () => {
    let counter = 0;
    const bar = Progress.createBar('Compilation', 7, counter, '{percentage}%', {});
    await this.prepareSvelteCore();
    bar.update(++counter);

    const [entryPointsSvelte, entryPointsTS, entryPointsCSS] = await Promise.all([
      glob(this.svelteWildcard),
      glob(this.typescriptWildcard),
      glob(this.cssWildcard)
    ]);
    bar.update(++counter);

    await processCSSFiles(entryPointsCSS, this.setFilesMap);
    bar.update(++counter);

    const logLevel = 'silent';
    // const logLevel = Logger.level.toLowerCase() as never;

    await Promise.all([
      buildTypeScript(entryPointsTS, this.setFilesMap, logLevel),
      buildSvelte(entryPointsSvelte, this.setFilesMap, { generate: 'ssr', logLevel }),
      buildSvelte(entryPointsSvelte, this.setFilesMap, { generate: 'dom', logLevel })
    ]);
    bar.update(++counter);

    const o = { filesMap: this.filesMap };
    const dst = [PREFIX, config.compiledRoot].join(SEPARATOR);

    await Promise.all([
      replaceImports(this.componentsWildcard, { ...o, overwriteOriginal: true, dst: OUTDIR_SSSX }),
      replaceImports(this.routesWildcard, { ...o, dst }),
      replaceImports(this.compiledWildcard, { ...o, dst, matchHashesImports: true })
    ]);
    bar.update(++counter);

    await replaceImports(this.routesDynamicWildcard, {
      ...o,
      dst,
      matchHashesImports: true
    });
    bar.update(++counter);

    await this.copyDynamicFiles();
    bar.update(++counter);
    bar.stop();
  };

  private copyDynamicFiles = async () => {
    const dynamicFiles = Object.keys(this.filesMap).filter(
      (a) =>
        a.startsWith([config.sourceRoot, config.routesPath].join(SEPARATOR)) &&
        a.endsWith(`${SEPARATOR}${DYNAMIC_NAME}.js`)
    );

    await Promise.all(
      dynamicFiles.map((key) => {
        const from = this.filesMap[key][0] || '';
        const path = from.split(`/${config.distDir}/${config.compiledRoot}/`)[1];
        const to = [OUTDIR_SSSX, path].join(SEPARATOR);
        const dir = to.split(SEPARATOR).slice(0, -1).join(SEPARATOR);
        ensureDirExists(dir);

        this.filesMap[key].push(to);
        return fs.copyFile(from, to);
      })
    );
  };

  private previouslyGeneratedRoutes =
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
      const modules = await prepareRouteModules(template, this.filesMap);
      this.routeModules[template] = modules;
    }
  };

  private getRoutePaths = async (template: string) => {
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
        allTemplates.map((t) => {
          return prepareRoute(this.filesMap, t, this.routeModules[t], 'removals');
        })
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
  public generateRequests = async (routes = ['*'], updatesOnly = false) => {
    const templates = Object.keys(this.routeModules);

    const existingRoutes = templates.map(getTemplateRoute);
    const previousRoutes = this.previouslyGeneratedRoutes;
    const diff = difference(existingRoutes, previousRoutes);

    const newTemplates = templates.filter((template) => diff.includes(getTemplateRoute(template)));

    const filteredTemplates = routes.includes('*')
      ? templates
      : templates.filter((path) => routes.includes(getTemplateRoute(path)));

    // TODO: DRY
    this.addedRequests = (
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

  public compileAllHTML = async (requests: Request[]) => {
    const bar = Progress.createBar(
      'HTML',
      requests.length,
      0,
      '{percentage}% | {value}/{total} | {route}',
      { route: '' }
    );

    const timePerPage = [];

    for (let i = 0; i < requests.length; i++) {
      const { item, path, template, dynamic } = requests[i];
      const { ssr, data } = this.routeModules[template];

      // Logger.log('compileAllHTML', template);

      const before = new Date().getTime();
      await compileHTML({
        item,
        outdir: path,
        ssrModule: ssr,
        dataModule: data,
        filesMap: this.filesMap,
        dynamic,
        prettify: isDev,
        minify: isProduction
      });
      const after = new Date().getTime();
      const diff = after - before;
      timePerPage.push(diff);

      bar.update(i, { route: path.replace(process.cwd(), '') });
    }

    const sum = timePerPage.reduce((a, b) => a + b);
    const average = sum / requests.length;

    bar.update(requests.length, {
      route: `${(average / 1000).toFixed(5)} seconds per page`
    });
    bar.stop();
  };

  /**
   * SSSX builds only routes that have to be updated.
   */
  public isIncremental = false;
  // TODO: change back to multi-core rendering before the release
  public renderPool = async (renderOptions: RenderOptions = defaultRenderOptions) => {
    const options = Object.assign({}, defaultRenderOptions, renderOptions);
    if (options.updatesOnly) this.isIncremental = true;

    await this.prepareRoutes();
    await this.generateAllPaths();
    await this.generateRequests(options.routes, options.updatesOnly);
    await this.compileAllHTML(this.addedRequests);
  };

  // public _renderPool = async (renderOptions: RenderOptions = defaultRenderOptions) => {
  //   const options = Object.assign({}, defaultRenderOptions, renderOptions);
  //   const numberOfWorkers = os.cpus().length;

  //   const pool = workerpool.pool(path.resolve(__dirname, 'worker.js'), {
  //     minWorkers: numberOfWorkers,
  //     maxWorkers: numberOfWorkers,
  //     workerType: 'process'
  //   });

  //   await this.prepareRoutes();
  //   await this.generateRequests(options.routes, options.updatesOnly);

  //   const LENGTH = this.addedRequests.length;
  //   const batchSize = Math.ceil(LENGTH / numberOfWorkers);
  //   const numberOfBatches = Math.floor(LENGTH / batchSize);

  //   const array: Array<Request[]> = sliceArray(this.addedRequests, batchSize);

  //   this.log(`Starting with ${numberOfBatches} batches:`);

  //   const promises = [];
  //   for (let i = 0; i < array.length; i++) {
  //     const batch = array[i];
  //     this.log(`Batched`, batch.length);
  //     const promise = pool.exec('render', [batch]);
  //     promises.push(promise);
  //   }

  //   // TODO: add progress bar
  //   const before = new Date().getTime();
  //   await Promise.all(promises);
  //   const after = new Date().getTime();
  //   const delta = after - before;

  //   Logger.log(`DONE ${(delta / 1000).toFixed(2)} seconds`);
  //   await pool.terminate();
  // };

  public getRequests = (type: 'added' | 'removed' = 'added') => {
    const requests = type === 'added' ? this.addedRequests : this.removedRequests;
    return requests.map(({ path, template }) => ({ path, template }));
  };

  public runPlugins = async () => {
    const { plugins } = config;

    const modules = Object.keys(plugins);
    for (let i = 0; i < modules.length; i++) {
      const key = modules[i]; // like "@sssx/sitemap-plugin"
      Logger.verbose(`Loading plugin "${key}"`);
      try {
        const module = (await import(key)).default;
        const value = plugins[key];
        const plugin = module(value);
        await plugin(config, this);
      } catch (err) {
        Logger.error(chalk.red(`Error loading and running plugin "${key}"`), err);
      }
    }
  };

  public finalize = async () => {
    fs.sortFile();
    Progress.stop();
  };
}
