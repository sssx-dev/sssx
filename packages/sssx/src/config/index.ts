import fs from 'fs'
import type { Config } from '../types/Config.js';

const defaultConfig:Partial<Config> = {
    distDir: `.sssx`,
    outDir: `dist`,
    appDir: '__SSSX__',
    basePath: '',
    routesPath: `routes`,
    routeName: `route`,
    componentsPath: `components`,
    stylesPath: `styles`,
    sourceRoot: `src`,
    plugins: [],
    ssrRoot: 'ssr',
    compiledRoot: 'compiled',
    filenamesPrefix: 'sssx'
}

const userConfigPath = `${process.cwd()}/sssx.config.js`
const userConfig = fs.existsSync(userConfigPath)
    ? (await import(userConfigPath)).default
    : {}

export const config = Object.assign({}, defaultConfig, userConfig) as Config

export const PREFIX = `${process.cwd()}/${config.distDir}`
export const OUTDIR = `${process.cwd()}/${config.outDir}`

export const COMPILED = `${PREFIX}/${config.compiledRoot}`
export const SSR = `${PREFIX}/${config.ssrRoot}`
export const OUTDIR_SSSX = `${OUTDIR}/${config.appDir}`

// used for referencing inside HTML
export const ROOT_DIR = config.basePath!.length > 0
    ? `${config.basePath}/${config.appDir}`
    : `/${config.appDir}`