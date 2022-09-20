import fs from 'fs';
import path from 'path';
import { SEPARATOR } from '../constants.js';
import type { Config } from '../types/Config.js';

const defaultConfig: Partial<Config> = {
  distDir: `.sssx`,
  outDir: `dist`,
  appDir: '__SSSX__',
  basePath: '',
  routesPath: `routes`,
  routeName: `route`,
  componentsPath: `components`,
  stylesPath: `styles`,
  sourceRoot: `src`,
  plugins: {},
  ssrRoot: 'ssr',
  compiledRoot: 'compiled',
  filenamesPrefix: 'sssx'
};

const loadConfig = async (input = path.resolve(process.cwd(), 'sssx.config.js')) => {
  if (fs.existsSync(input)) {
    const c = await import(input);
    return c.default;
  }
  return {};
};

const userConfig = await loadConfig();

export const config = Object.assign({}, defaultConfig, userConfig) as Config;

/**
 * Folder where SSSX stores related files
 * @default `./.sssx`
 */
export const PREFIX = [process.cwd(), config.distDir].join(SEPARATOR);

/**
 * Folder where exported HTML, CSS, JS and any other files are stored
 * @default `./dist`
 */
export const OUTDIR = [process.cwd(), config.outDir].join(SEPARATOR);

/**
 * Folder where we store one text file per route, and it includes all paths for the given route.
 */
export const GENERATED_ROUTES = [process.cwd(), config.distDir, config.routesPath].join(SEPARATOR);

export const COMPILED = [PREFIX, config.compiledRoot].join(SEPARATOR);
export const SSR = [PREFIX, config.ssrRoot].join(SEPARATOR);
export const OUTDIR_SSSX = [OUTDIR, config.appDir].join(SEPARATOR);

// used for referencing inside HTML
export const ROOT_DIR =
  (config.basePath || '').length > 0
    ? [config.basePath, config.appDir].join(SEPARATOR)
    : `${SEPARATOR}${config.appDir}`;
