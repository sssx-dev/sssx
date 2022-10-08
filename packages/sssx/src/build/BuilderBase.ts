import path from 'path';
import chalk from 'chalk';
import Logger from '@sssx/logger';
import { customAlphabet } from 'nanoid/non-secure';
import { config, PREFIX, OUTDIR } from '@sssx/config';
import { fileURLToPath } from 'url';

import fs from '../lib/fs.js';
import Progress from '../cli/Progress.js';
import { SEPARATOR, SVELTEJS } from '../constants.js';

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

export class BuilderBase {
  protected id: string;
  protected svelteLib = [__dirname, `..`, `patches`, SVELTEJS].join(SEPARATOR);

  protected svelteWildcard = `${process.cwd()}/${config.sourceRoot}/**/*.svelte`;
  protected typescriptWildcard = `${process.cwd()}/${config.sourceRoot}/**/*.ts`;
  protected cssWildcard = `${process.cwd()}/${config.sourceRoot}/**/*.css`;

  protected compiledWildcard = `${PREFIX}/${config.compiledRoot}/**/*.js`;
  protected componentsWildcard = `${PREFIX}/${config.compiledRoot}/components/**/*.js`;
  protected routesWildcard = `${PREFIX}/${config.compiledRoot}/routes/**/*.js`;
  protected routesDynamicWildcard = `${PREFIX}/${config.compiledRoot}/routes/**/*-dynamic-*.js`;
  protected ssrRoutesWildcard = `${PREFIX}/${config.ssrRoot}/${config.routesPath}/**/*.js`;

  protected ssrRouteTemplates: string[] = [];
  protected isWorker;

  public readonly config = config;
  public readonly outdir = OUTDIR;

  constructor(options: Partial<Options> = defaultOptions) {
    this.id = nanoid();
    options = Object.assign({}, defaultOptions, options);
    this.isWorker = options.isWorker;
    Logger.verbose(`Creating new SSSX Builder`);
  }

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
