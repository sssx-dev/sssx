import fs from 'fs';
import path from 'path';
import type { Config as C } from './types.js';

export type Config = C;

const isWin = process.platform === 'win32';
const SEPARATOR = isWin ? '\\' : '/';

const defaultConfig: Partial<Config> = {
  distDir: `.sssx`,
  outDir: `dist`,
  publicDir: `public`,
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

/**
 * Configuration for existing environment parsed from `sssx.config.js`
 */
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

/**
 * Folder where we store client generated javascript code (svelte + typescript sources)
 */
export const COMPILED = [PREFIX, config.compiledRoot].join(SEPARATOR);

/**
 * Folder where we store server generated javascript code (svelte + typescript sources)
 */
export const SSR = [PREFIX, config.ssrRoot].join(SEPARATOR);

/**
 * Absolute path for @config.appDir
 * @default './dist/__SSSX__'
 */
export const OUTDIR_SSSX = [OUTDIR, config.appDir].join(SEPARATOR);

/**
 * Root dir is used for referencing inside generated HTML
 */
export const ROOT_DIR =
  (config.basePath || '').length > 0
    ? [config.basePath, config.appDir].join(SEPARATOR)
    : `${SEPARATOR}${config.appDir}`;
