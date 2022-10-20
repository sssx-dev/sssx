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

export const skypackResolver = (): Plugin => {
  const setup = (build: PluginBuild) => {
    build.onResolve({ filter: REGEX }, async ({ path }): Promise<OnResolveResult> => {
      Logger.log(`Skypack onresolve`, path);
      const url = `${path}/hello/world`;
      return { path: url, external: true };
    });
  };

  return {
    name: 'skypack',
    setup
  };
};
