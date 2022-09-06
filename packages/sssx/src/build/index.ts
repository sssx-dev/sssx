import fs from 'fs/promises';
import glob from 'tiny-glob';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

import { customAlphabet } from 'nanoid/non-secure';
import workerpool from 'workerpool';
// import { performance, PerformanceObserver} from 'node:perf_hooks'

import { buildTypeScript } from './buildTypeScript.js';
import { buildSvelte } from './buildSvelte.js';
import { buildSvelteCore } from './buildSvelteCore.js';
import { replaceImports } from '../plugins/replaceImports.js';
import { processCSSFiles } from './processCSSFiles.js';
import { prepareRoute, prepareRouteModules } from './prepareRoute.js';

import type { RouteModules, ItemPathTemplate } from './prepareRoute.js';
import { compileHTML } from './compileHTML.js';

import { PREFIX, OUTDIR_SSSX, config } from '../config/index.js';
import { sliceArray } from '../utils/sliceArray.js';
import type { FilesMap } from '../types/index.js';
import { ensureDirExists } from '../utils/ensureDirExists.js';
import { SEPARATOR } from '../utils/resolve.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nanoid = customAlphabet(`0123456789abcdef`, 5);
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
const noop = (...args: any[]) => {};

type Options = {
  isDev: boolean;
  isWorker: boolean;
};

const defaultOptions: Options = {
  isDev: false,
  isWorker: false
};

export class Builder {
  private id: string;
  private svelteLib = `${__dirname}/../patches/svelte.js`;

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
  private paths: ItemPathTemplate[] = [];

  private filesMap: FilesMap = {};

  private isDev;
  private isWorker;

  constructor(options: Partial<Options> = defaultOptions) {
    this.id = nanoid();
    options = Object.assign({}, defaultOptions, options);
    this.isDev = options.isDev;
    this.isWorker = options.isWorker;
    this.log(`Creating new SSSX Builder`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private log = (...args: any[]) =>
    console.log(`${this.isWorker ? '[W]' : '[B]'}${this.id}:`, ...args);
  // private log = noop

  private prepareSvelteCore = async () => {
    const hashedSvelteCorePath = await buildSvelteCore([this.svelteLib], OUTDIR_SSSX);
    this.filesMap['svelte.js'] = [hashedSvelteCorePath];

    const filename = hashedSvelteCorePath.split(`/`).pop() || '';
    const svelteCorePath = path.resolve(PREFIX, config.compiledRoot, filename);
    await fs.copyFile(this.svelteLib, svelteCorePath);
  };

  private setFilesMap = (key: string, value: string) => {
    if (!this.filesMap[key]) this.filesMap[key] = [];
    this.filesMap[key].push(value);
  };

  public setup = async () => {
    await this.prepareSvelteCore();

    const [entryPointsSvelte, entryPointsTS, entryPointsCSS] = await Promise.all([
      glob(this.svelteWildcard),
      glob(this.typescriptWildcard),
      glob(this.cssWildcard)
    ]);

    await processCSSFiles(entryPointsCSS, this.setFilesMap);

    await Promise.all([
      buildTypeScript(entryPointsTS, this.setFilesMap),
      buildSvelte(entryPointsSvelte, 'ssr', this.setFilesMap),
      buildSvelte(entryPointsSvelte, 'dom', this.setFilesMap)
    ]);

    // this.log(`FilesMap`, this.filesMap);

    const o = { filesMap: this.filesMap };
    const dst = `${PREFIX}/${config.compiledRoot}`;

    await Promise.all([
      replaceImports(this.componentsWildcard, { ...o, overwriteOriginal: true, dst: OUTDIR_SSSX }),
      replaceImports(this.routesWildcard, { ...o, dst }),
      replaceImports(this.compiledWildcard, { ...o, dst, matchHashesImports: true })
    ]);

    // console.log(`setup`, this.filesMap);

    await replaceImports(this.routesDynamicWildcard, {
      ...o,
      dst,
      // overwriteOriginal: true,
      matchHashesImports: true
    });

    await this.copyDynamicFiles();
  };

  private copyDynamicFiles = async () => {
    const dynamicFiles = Object.keys(this.filesMap).filter(
      (a) =>
        a.startsWith([config.sourceRoot, config.routesPath].join(SEPARATOR)) &&
        a.endsWith(`${SEPARATOR}dynamic.js`)
    );

    await Promise.all(
      dynamicFiles.map((key) => {
        const from = this.filesMap[key][0] || '';
        const path = from.split(`/${config.distDir}/${config.compiledRoot}/`)[1];
        const to = `${OUTDIR_SSSX}/${path}`;
        const dir = to.split(SEPARATOR).slice(0, -1).join(SEPARATOR);
        ensureDirExists(dir);

        this.filesMap[key].push(to);
        return fs.copyFile(from, to);
      })
    );
  };

  public prepareRoutes = async () => {
    const templates = (this.ssrRouteTemplates = await glob(this.ssrRoutesWildcard));

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const modules = await prepareRouteModules(template, this.filesMap);
      this.routeModules[template] = modules;
    }
  };

  public generateAllPaths = async () => {
    const templates = Object.keys(this.routeModules);

    // @example template='.sssx/ssr/routes/blog/index.js'
    await Promise.all(
      templates.map(async (template) => {
        const modules = this.routeModules[template];
        const array = await prepareRoute(this.filesMap, template, modules, 'all');
        const paths = array.map(({ path }) =>
          path.replace(`${process.cwd()}/${config.outDir}`, ``).toLowerCase()
        );

        // saving to file route-name.txt
        const dir = [process.cwd(), config.distDir, config.routesPath].join(`/`);
        ensureDirExists(dir);
        const filename = template.split(`/`)[3] + `.txt`;
        fs.writeFile(`${dir}/${filename}`, paths.sort().join(`\n`), { encoding: 'utf8' });
      })
    );
  };

  public generatePaths = async (routes = ['*'], updatesOnly = false) => {
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
        this.paths = this.paths.concat(array);
      })
    );
  };

  /**
   * In the incremental updates mode, some of the routes could become outdated
   * we call `processRemovals` to remove these folders
   */
  public processRemovals = async () => {
    const templates = Object.keys(this.routeModules);

    const all: string[][] = await Promise.all(
      templates.map(async (template) => {
        const modules = this.routeModules[template];
        const array = await prepareRoute(this.filesMap, template, modules, 'removals');
        return array.map((a) => a.path);
      })
    );

    const paths = all.flat();

    // TODO: color this in red
    this.log(`Processing removals:`);
    paths.map(async (dir) => {
      await fs.rm(dir, { recursive: true });
      console.log(`removed ${dir}`);
    });
  };

  public render = async (paths: ItemPathTemplate[]) => {
    this.log(`render`, { pathsLength: paths.length });

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
    }

    this.log(`Done`);
  };

  // TODO: change back to multi-core rendering before the release
  public renderPool = async (routes = ['*'], updatesOnly = false) => {
    await this.prepareRoutes();
    await this.generateAllPaths();
    await this.generatePaths(routes, updatesOnly);
    await this.render(this.paths);
  };

  public _renderPool = async (routes = ['*'], updatesOnly = false) => {
    const numberOfWorkers = os.cpus().length;

    const pool = workerpool.pool(path.resolve(__dirname, 'worker.js'), {
      minWorkers: numberOfWorkers,
      maxWorkers: numberOfWorkers,
      workerType: 'process'
    });

    await this.prepareRoutes();
    await this.generatePaths(routes, updatesOnly);

    const LENGTH = this.paths.length;
    const batchSize = Math.ceil(LENGTH / numberOfWorkers);
    const numberOfBatches = Math.floor(LENGTH / batchSize);

    const array: Array<ItemPathTemplate[]> = sliceArray(this.paths, batchSize);

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

  public getPaths = () => {
    return this.paths.map(({ path, template }) => ({ path, template }));
  };

  public runPlugins = async () => {
    const plugins = config.plugins || [];

    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];
      await plugin(config, this);
    }
  };
}
