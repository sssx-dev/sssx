import fs from 'fs';
import type { OnResolveResult, Plugin, PluginBuild } from 'esbuild';
import { SEPARATOR } from '../constants.js';
import Logger from '@sssx/logger';

const REGEX = /^@?(([a-z0-9]+-?)+\/?)+$/;

const json = JSON.parse(fs.readFileSync(`${process.cwd()}${SEPARATOR}package.json`, 'utf8'));
const deps = {
  ...json.devDependencies,
  ...json.dependencies
} as {
  [key: string]: string;
};

const log = (...args: any[]) => {
  fs.appendFileSync(`${process.cwd()}/esbuild.log`, JSON.stringify(args, null, 2) + `\n`, 'utf8');
};

const name = 'skypack:resolve';

export const skypackResolver = (): Plugin => {
  const setup = (build: PluginBuild) => {
    Logger.verbose(`Setting up ${name}`);

    build.onResolve({ filter: /(.css|.js)/ }, async (args): Promise<OnResolveResult> => {
      const path = args.path;
      console.log('skypack:css', path, args.importer);
      return { path, external: path.startsWith(process.cwd()) ? false : true };
    });

    build.onResolve({ filter: REGEX }, async (args): Promise<OnResolveResult> => {
      const { path } = args;

      console.log('skypack', path, args.importer);

      if (
        [`svelte/internal`, `svelte`].includes(path) ||
        path.startsWith(`@sssx`) ||
        path.includes('../') ||
        path.endsWith('.css')
      )
        return { path, external: true };

      const url = `https://cdn.skypack.dev/${path}`;

      return { path: url, external: true };
    });

    build.onLoad({ filter: /\.css$/ }, () => ({ contents: '' }));

    // build.onEnd((result) => {
    //   Logger.log(`Finished ${name}`, result, array);
    // });
  };

  return {
    name,
    setup
  };
};
