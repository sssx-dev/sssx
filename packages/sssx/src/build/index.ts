import glob from 'tiny-glob';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import colors from 'ansi-colors';

import { customAlphabet } from 'nanoid/non-secure';
import workerpool from 'workerpool';

import fs from '../lib/fs.js';
import { buildTypeScript } from './buildTypeScript.js';
import { buildSvelte } from './buildSvelte.js';
import { buildSvelteCore } from './buildSvelteCore.js';
import { replaceImports } from '../plugins/replaceImports.js';
import { processCSSFiles } from './processCSSFiles.js';
import { prepareRoute, prepareRouteModules } from './prepareRoute.js';
import { compileHTML } from './compileHTML.js';
import { PREFIX, OUTDIR_SSSX, config } from '../config/index.js';
import { sliceArray } from '../utils/sliceArray.js';
import { ensureDirExists } from '../utils/ensureDirExists.js';
import { SEPARATOR, DYNAMIC_NAME, SVELTEJS } from '../constants.js';
import Progress from '../cli/Progress.js';

import type { FilesMap, RouteModules, ItemPathTemplate } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nanoid = customAlphabet(`0123456789abcdef`, 5);

type Options = {
  isWorker: boolean;
};

const defaultOptions: Options = {
  isWorker: false
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
  private addedRequests: ItemPathTemplate[] = [];
  private removedRequests: ItemPathTemplate[] = [];

  private filesMap: FilesMap = {};
  private isWorker;

  constructor(options: Partial<Options> = defaultOptions) {
    this.id = nanoid();
    options = Object.assign({}, defaultOptions, options);
    this.isWorker = options.isWorker;
    // this.log(`Creating new SSSX Builder`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private log = (...args: any[]) =>
    console.log(chalk.yellow(`${this.isWorker ? '[W]' : '[B]'}${this.id}:`), ...args);

  private prepareSvelteCore = async () => {
    const hashedSvelteCorePath = await buildSvelteCore([this.svelteLib], OUTDIR_SSSX);
    this.filesMap[SVELTEJS] = [hashedSvelteCorePath];

    const filename = hashedSvelteCorePath.split(`/`).pop() || '';
    const svelteCorePath = path.resolve(PREFIX, config.compiledRoot, filename);
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
    const bar = Progress.createBar('compilation', 7, 0, '| Compilation | {percentage}%', {});
    await this.prepareSvelteCore();
    bar.update(1);

    const [entryPointsSvelte, entryPointsTS, entryPointsCSS] = await Promise.all([
      glob(this.svelteWildcard),
      glob(this.typescriptWildcard),
      glob(this.cssWildcard)
    ]);
    bar.update(2);

    await processCSSFiles(entryPointsCSS, this.setFilesMap);
    bar.update(3);

    await Promise.all([
      buildTypeScript(entryPointsTS, this.setFilesMap),
      buildSvelte(entryPointsSvelte, this.setFilesMap, { generate: 'ssr' }),
      buildSvelte(entryPointsSvelte, this.setFilesMap, { generate: 'dom' })
    ]);
    bar.update(4);

    const o = { filesMap: this.filesMap };
    const dst = [PREFIX, config.compiledRoot].join(SEPARATOR);

    await Promise.all([
      replaceImports(this.componentsWildcard, { ...o, overwriteOriginal: true, dst: OUTDIR_SSSX }),
      replaceImports(this.routesWildcard, { ...o, dst }),
      replaceImports(this.compiledWildcard, { ...o, dst, matchHashesImports: true })
    ]);
    bar.update(5);

    await replaceImports(this.routesDynamicWildcard, {
      ...o,
      dst,
      matchHashesImports: true
    });
    bar.update(6);

    await this.copyDynamicFiles();
    bar.update(7);
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
    const paths = array
      .map(({ path }) =>
        path.replace([process.cwd(), config.outDir].join(SEPARATOR), ``).toLowerCase()
      )
      .sort();

    // saving to file route-name.txt
    const dir = [process.cwd(), config.distDir, config.routesPath].join(SEPARATOR);
    ensureDirExists(dir);

    const filename = template.split(SEPARATOR)[3] + `.txt`;
    await fs.writeFile([dir, filename].join(SEPARATOR), paths.sort().join(`\n`), {
      encoding: 'utf8'
    });
  };

  /**
   * stores all routes into .sssx/routes/<route_name>.txt
   * runs in parallel
   * @example template='.sssx/ssr/routes/blog/index.js'
   */
  public generateAllPaths = async () => {
    const templates = Object.keys(this.routeModules);
    await Promise.all(templates.map(this.getRoutePaths));
  };

  public generateRequests = async (routes = ['*'], updatesOnly = false) => {
    const templates = Object.keys(this.routeModules);

    const filteredTemplates = routes.includes('*')
      ? templates
      : templates.filter((path) => routes.includes(path.split(`/`).slice(-2)[0]));

    await Promise.all(
      filteredTemplates.map(async (template) => {
        const modules = this.routeModules[template];
        const array = await prepareRoute(
          this.filesMap,
          template,
          modules,
          updatesOnly ? 'updates' : 'all'
        );
        this.addedRequests = this.addedRequests.concat(array);
      })
    );
  };

  /**
   * In the incremental updates mode, some of the routes could become outdated
   * we call `processRemovals` to remove these folders
   */
  public processRemovals = async () => {
    const templates = Object.keys(this.routeModules);

    this.removedRequests = (
      await Promise.all(
        templates.map(async (template) => {
          const modules = this.routeModules[template];
          const array = await prepareRoute(this.filesMap, template, modules, 'removals');
          return array;
        })
      )
    ).flat();

    const paths = this.removedRequests.map((r) => r.path).filter((path) => fs.existsSync(path));

    if (paths.length > 0) {
      const bar = Progress.createBar(
        'removal',
        paths.length,
        0,
        '| Removing old routes | {percentage}% | {value}/{total} | {route}',
        { route: '' }
      );

      paths.map((dir, index) => {
        fs.rmSync(dir, { recursive: true });
        bar.update(index, { route: dir.replace(process.cwd(), '') });
      });

      bar.stop();
    }
  };

  public compileAllHTML = async (paths: ItemPathTemplate[]) => {
    const bar = Progress.createBar(
      'html',
      paths.length,
      0,
      '| Generating static HTML | {percentage}% | {value}/{total} | {route}',
      { route: '' }
    );

    for (let i = 0; i < paths.length; i++) {
      const { item, path, template, dynamic } = paths[i];
      const { ssr, data } = this.routeModules[template];

      await compileHTML({
        item,
        outdir: path,
        ssrModule: ssr,
        dataModule: data,
        filesMap: this.filesMap,
        dynamic
      });

      bar.update(i, { route: path.replace(process.cwd(), '') });
    }

    bar.update(paths.length, { route: 'done' });
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

  public _renderPool = async (renderOptions: RenderOptions = defaultRenderOptions) => {
    const options = Object.assign({}, defaultRenderOptions, renderOptions);
    const numberOfWorkers = os.cpus().length;

    const pool = workerpool.pool(path.resolve(__dirname, 'worker.js'), {
      minWorkers: numberOfWorkers,
      maxWorkers: numberOfWorkers,
      workerType: 'process'
    });

    await this.prepareRoutes();
    await this.generateRequests(options.routes, options.updatesOnly);

    const LENGTH = this.addedRequests.length;
    const batchSize = Math.ceil(LENGTH / numberOfWorkers);
    const numberOfBatches = Math.floor(LENGTH / batchSize);

    const array: Array<ItemPathTemplate[]> = sliceArray(this.addedRequests, batchSize);

    this.log(`Starting with ${numberOfBatches} batches:`);

    const promises = [];
    for (let i = 0; i < array.length; i++) {
      const batch = array[i];
      this.log(`Batched`, batch.length);
      const promise = pool.exec('render', [batch]);
      promises.push(promise);
    }

    // TODO: add progress bar
    const before = new Date().getTime();
    await Promise.all(promises);
    const after = new Date().getTime();
    const delta = after - before;

    console.log(`DONE ${(delta / 1000).toFixed(2)} seconds`);
    await pool.terminate();
  };

  public getRequests = (type: 'added' | 'removed' = 'added') => {
    const requests = type === 'added' ? this.addedRequests : this.removedRequests;
    return requests.map(({ path, template }) => ({ path, template }));
  };

  public runPlugins = async () => {
    const { plugins } = config;

    const modules = Object.keys(plugins);
    for (let i = 0; i < modules.length; i++) {
      const key = modules[i]; // like "@sssx/sitemap-plugin"
      this.log(`Loading plugin "${key}"`);
      try {
        const module = (await import(key)).default;
        const value = plugins[key];
        const plugin = module(value);
        // this.log(`Plugin ${key}`, plugin);
        await plugin(config, this);
      } catch (err) {
        this.log(chalk.red(`Error loading and running plugin "${key}"`), err);
      }
    }
  };

  public finalize = async () => {
    fs.sortFile();
    Progress.stop();
  };
}
