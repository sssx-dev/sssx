import Logger from '@sssx/logger';
import { config } from '@sssx/config';

import { build } from 'esbuild';
import type { LogLevel, Plugin } from 'esbuild';
import sveltePreprocess from 'svelte-preprocess';
import autoprefixer from 'autoprefixer';
import { skypackResolver } from '../../plugins/skypack.js';

import fs from '../../lib/fs.js';
import { BASE } from './base.js';
import { wrapHydratableComponents } from '../wrapHydratableComponents.js';
import { ensureDirExists } from '../../utils/ensureDirExists.js';

import esbuildSvelte from '../../lib/esbuildSvelte.js';
import sveltePlugin from '../../../dist/lib/esbuildSvelte';

type Options = {
  generate?: 'dom' | 'ssr' | false;
  logLevel?: LogLevel;
  /** bundles CSS in JS */
  bundleCSSinJS?: boolean;
  /** preserve comments, @default false */
  preserveComments?: boolean;
  /** Documentation: https://esbuild.github.io/api/#minify */
  minify?: boolean;
  /** Documentation: https://esbuild.github.io/api/#bundle */
  bundle?: boolean;
};

const defaultOptions: Options = {
  generate: 'ssr',
  logLevel: 'silent',
  bundleCSSinJS: true,
  preserveComments: false,
  minify: false,
  bundle: false
};

export const buildSvelte = async (
  entryPoints: string[],
  setFilesMap: (k: string, v: string) => void,
  buildOptions = defaultOptions
) => {
  const options = Object.assign({}, defaultOptions, buildOptions);
  const { generate, logLevel } = options;
  const outdir = `${config.distDir}/${generate === 'ssr' ? config.ssrRoot : config.compiledRoot}`;
  ensureDirExists(outdir);

  const { preserveComments, minify, bundle } = options;

  const naming =
    generate === 'dom' ? { entryNames: `[dir]/${config.filenamesPrefix}-[name]-[hash]` } : {};

  const sveltePlugin = esbuildSvelte({
    compilerOptions: {
      css: options.bundleCSSinJS,
      generate,
      preserveComments,
      hydratable: true
    },
    preprocess: [
      sveltePreprocess({
        // TODO: should we import postcss.config.js here?
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        postcss: [autoprefixer]
      })
    ]
  });

  let plugins: Plugin[] = [
    // postCssPlugin()
  ];

  if (generate === 'dom') plugins = [sveltePlugin, skypackResolver()];
  else plugins = [sveltePlugin];

  const write = false;

  Logger.log(`plugins`, plugins);

  const result = await build({
    entryPoints,
    ...BASE,
    ...naming,
    bundle,
    outdir,
    minify,
    sourcemap: 'inline',
    write,
    logLevel,
    plugins
  });

  // TODO: resturcutre to call it .ssr/compiled/component/filename/hash.js
  // passing back mapping for component/route.ts -> .ssr/compiled/component/filename-hash.js
  result.outputFiles.map((output, index) => {
    const entry = entryPoints[index].replace(`.svelte`, `.js`);
    setFilesMap(entry, output.path);
  });

  // TODO: this should become another esbuild plugin
  // write out generated JS files from svelte files, and replace imports with js files too
  result.outputFiles.map((output) => {
    const path = output.path.split(`/`).slice(0, -1).join(`/`);
    ensureDirExists(path);

    Logger.verbose('buildSvelte', output.path);

    let text = output.text.replaceAll(`.svelte`, `.js`);

    if (
      generate === 'ssr' &&
      (output.path.includes(`/${config.routesPath}/`) ||
        output.path.includes(`/${config.componentsPath}/`))
    ) {
      text = wrapHydratableComponents(text);
    }
    fs.writeFileSync(output.path, text, 'utf8');
  });
};
