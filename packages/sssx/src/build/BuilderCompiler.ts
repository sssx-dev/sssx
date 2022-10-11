import path from 'path';
import glob from 'tiny-glob';
import Logger from '@sssx/logger';

import fs from '../lib/fs.js';
import Progress from '../cli/Progress.js';
import { BuilderBase } from './BuilderBase.js';
import { buildSvelte } from './compiler/buildSvelte.js';
import { buildTypeScript } from './compiler/buildTypeScript.js';
import { buildSvelteCore } from './compiler/buildSvelteCore.js';
import { processCSSFiles } from './processCSSFiles.js';
import { replaceImports, replaceImportsFresh } from '../plugins/replaceImports.js';

import type { FilesMap } from '../types';
import { config, OUTDIR_SSSX, PREFIX } from '@sssx/config';
import { DYNAMIC_NAME, SEPARATOR, SVELTEJS } from '../constants.js';
import { ensureDirExists } from '../utils/ensureDirExists.js';

export class BuilderCompiler extends BuilderBase {
  protected filesMap: FilesMap = {};

  protected setFilesMap = (key: string, value: string) => {
    if (!this.filesMap[key]) this.filesMap[key] = [];
    this.filesMap[key].push(value);
  };

  public getFileFromFilesMap = (sourcePath: string, index = 0) => {
    const targetPath = this.filesMap[sourcePath][index];
    Logger.verbose(`getFileFromFilesMap`, { sourcePath, targetPath });
    return targetPath;
  };

  protected prepareSvelteCore = async () => {
    const hashedSvelteCorePath = await buildSvelteCore([this.svelteLib], OUTDIR_SSSX);
    this.filesMap[SVELTEJS] = [hashedSvelteCorePath];

    const filename = hashedSvelteCorePath.split(`/`).pop() || '';
    const dst = path.resolve(PREFIX, config.compiledRoot);
    ensureDirExists(dst);

    const svelteCorePath = path.resolve(dst, filename);
    await fs.copyFile(this.svelteLib, svelteCorePath);
  };
  /**
   * Compiles source code from svelte and typescript to javascript, creates SSR version for each route,
   * and client side compiled version of everything else:
   * - components
   * - dynamic scripts
   */
  public setup = async () => {
    let counter = 0;
    const STEPS = 7; // number of steps anticipated in this method below

    const bar = Progress.createBar('Compilation', STEPS, counter, '{percentage}%', {});
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

    replaceImportsFresh(this.ssrRoutesWildcard);
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
}
