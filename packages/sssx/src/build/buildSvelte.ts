import fs from '../lib/fs.js';
import { build } from 'esbuild';
import type { LogLevel } from 'esbuild';
import sveltePreprocess from 'svelte-preprocess';
import autoprefixer from 'autoprefixer';

import { BASE } from './base.js';
import { wrapHydratableComponents } from './wrapHydratableComponents.js';
import { config } from '@sssx/config';
import { ensureDirExists } from '../utils/ensureDirExists.js';

import esbuildSvelte from '../lib/esbuildSvelte.js';
import Logger from '@sssx/logger';

type Options = {
  generate?: 'dom' | 'ssr' | false;
  logLevel?: LogLevel;
};

const defaultOptions: Options = {
  generate: 'ssr',
  logLevel: 'silent'
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

  const naming =
    generate === 'dom' ? { entryNames: `[dir]/${config.filenamesPrefix}-[name]-[hash]` } : {};

  const result = await build({
    entryPoints,
    ...BASE,
    ...naming,
    bundle: false,
    outdir,
    minify: false, //so the resulting code is easier to understand
    sourcemap: 'inline',
    write: false,
    logLevel, //: 'silent',
    plugins: [
      // postCssPlugin(),
      esbuildSvelte({
        compilerOptions: {
          css: true, // bundles CSS in JS
          generate,
          // preserveComments: true,
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
      })
    ]
  });

  // passing back mapping for component/route.ts -> .ssr/compiled/component/filename-hash.js
  result.outputFiles.map((output, index) => {
    const entry = entryPoints[index].replace(`.svelte`, `.js`);
    setFilesMap(entry, output.path);
  });

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
    fs.writeFileSync(output.path, text, { encoding: 'utf-8' });
  });
};
