import Logger from '@sssx/logger';
import { config } from '@sssx/config';

import { build, type BuildResult, type OutputFile } from 'esbuild';
import type { LogLevel, Plugin } from 'esbuild';
import sveltePreprocess from 'svelte-preprocess';
import autoprefixer from 'autoprefixer';
import { skypackResolver } from '../../plugins/skypack.js';

import fs from '../../lib/fs.js';
import { BASE } from './base.js';
import { wrapHydratableComponents } from '../wrapHydratableComponents.js';
import { ensureDirExists } from '../../utils/ensureDirExists.js';

import esbuildSvelte from '../../lib/esbuildSvelte.js';
import { SEPARATOR } from '../../constants.js';
import { sha1 } from '../../utils/sha1.js';

type AllBuildResult = BuildResult & { outputFiles: OutputFile[] };

type GenerateType = 'dom' | 'ssr' | false;

type Options = {
  generate: GenerateType;
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
  /** all svelte files */
  entryPoints: string[],
  setFilesMap: (k: string, v: string) => void,
  buildOptions = defaultOptions
) => {
  const options = Object.assign({}, defaultOptions, buildOptions);

  // if (options.generate === 'dom')
  //   entryPoints = entryPoints.filter(
  //     (name) => !name.startsWith(config.sourceRoot + `/` + config.routesPath)
  //   );

  const result: AllBuildResult = await svelte2javascript(entryPoints, setFilesMap, options);

  // compile second time, and get plugins applied to javasc
  if (options.generate === 'dom') {
    const javascriptEntryPoints = result.outputFiles.map(({ path }) => path);
    // Logger.log(`buildSvelte`, javascriptEntryPoints);

    const { logLevel, minify } = options;
    const outdir = [config.distDir, config.compiledRoot].join(SEPARATOR);

    const newResult = await build({
      entryPoints: javascriptEntryPoints,
      ...BASE,
      bundle: true,
      outdir,
      minify,
      sourcemap: 'inline',
      write: true,
      allowOverwrite: true, // overwrite existing file
      logLevel,
      plugins: [skypackResolver()]
    });

    if (newResult.errors.length > 0) Logger.error(`buildSvelte`, newResult.errors);
  }
};

export const svelte2javascript = async (
  /** all svelte files */
  entryPoints: string[],
  setFilesMap: (k: string, v: string) => void,
  options: Options
) => {
  const { generate, logLevel, preserveComments, minify, bundle, bundleCSSinJS } = options;
  const outdir = `${config.distDir}/${generate === 'ssr' ? config.ssrRoot : config.compiledRoot}`;
  ensureDirExists(outdir);

  // const naming =
  //   generate === 'dom' ? { entryNames: `[dir]/${config.filenamesPrefix}-[name]-[hash]` } : {};

  const sveltePlugin = esbuildSvelte({
    compilerOptions: {
      css: bundleCSSinJS,
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

  const plugins: Plugin[] = [
    // postCssPlugin()
    sveltePlugin
  ];

  // don't write to the file system from esbuild, because we need to do postprocessing later.
  // TODO: ideally we build veerything via plugins and let esbuild just write to the file system.
  const write = false;

  const result = await build({
    entryPoints,
    ...BASE,
    // ...naming,
    bundle,
    outdir,
    minify,
    sourcemap: 'inline',
    write,
    logLevel,
    plugins
  });

  writeFiles(result, generate, entryPoints, setFilesMap);

  return result;
};

/**
 *
 * @param hashedFileName  '/Users/eugene/Desktop/sssx-monorepo/apps/example-blog/.sssx/compiled/components/sssx-confetti-LUM5ZDUS.js',
 * @return 'src/components/confetti.svelte'
 */
const getOriginalFilename = (hashedFileName: string) => {
  let output = hashedFileName.replace(process.cwd() + SEPARATOR, '');
  output = output.replace(config.distDir + SEPARATOR + config.compiledRoot, config.sourceRoot);
  output = output.replace(config.distDir + SEPARATOR + config.ssrRoot, config.sourceRoot);
  const last = output.split(SEPARATOR).slice(-1)[0];

  if (last.includes(config.filenamesPrefix + '-')) {
    const ext = last.split('.').slice(-1)[0];
    const name = last.split('-')[1];
    output = output.replace(last, `${name}.${ext}`);
  }

  return output;
};

const writeFiles = (
  result: AllBuildResult,
  generate: GenerateType,
  entryPoints: string[],
  setFilesMap: (k: string, v: string) => void
) => {
  // TODO: resturcutre to call it .ssr/compiled/component/filename/hash.js
  // passing back mapping for component/route.ts -> .ssr/compiled/component/filename-hash.js
  result.outputFiles.map(({ path }) => {
    const entryPoint = getOriginalFilename(path);
    setFilesMap(entryPoint, path);
  });

  const shouldHash = generate === 'dom';

  // TODO: this should become another esbuild plugin
  // write out generated JS files from svelte files, and replace imports with js files too
  result.outputFiles.map((output) => {
    const dir = output.path.split(SEPARATOR).slice(0, -1).join(SEPARATOR);
    ensureDirExists(dir);

    Logger.log('buildSvelte', output.path);

    let text = output.text.replaceAll(`.svelte`, `.js`);

    if (
      generate === 'ssr' &&
      (output.path.includes(`/${config.routesPath}/`) ||
        output.path.includes(`/${config.componentsPath}/`))
    ) {
      text = wrapHydratableComponents(text);
    }

    let path = output.path;
    if (shouldHash) {
      const hash = sha1(text);
      const newDir = path.replace('.js', ``);
      ensureDirExists(newDir);
      path = `${newDir}/${hash}.js`;
    }

    fs.writeFileSync(path, text, 'utf8');
  });
};
