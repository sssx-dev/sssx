import esbuild, { type Plugin, type BuildOptions, type Drop } from "esbuild";
import type { CompileOptions } from "svelte/types/compiler/interfaces";
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import { generateEntryPoint } from "./generateEntryPoint.ts";
import { type Config } from "../config.ts";
import { type RouteInfo } from "../routes/index.ts";

const defaultCompilerOptions: CompileOptions = {
  generate: "ssr",
  css: "none",
  hydratable: true,
};

export const generateSSR = async (
  config: Config,
  basedir: string,
  segment: RouteInfo,
  buildOptions: BuildOptions = {},
  plugins: Plugin[] = [],
  compilerSSROptions: Partial<CompileOptions> = {},
  isDev: boolean
) => {
  const compilerOptions: CompileOptions = {
    ...defaultCompilerOptions,
    ...compilerSSROptions,
  };
  if (isDev) {
    compilerOptions.dev = isDev;
    // gives Cannot read properties of null (reading 'sourcesContent') [plugin esbuild-svelte]
    compilerOptions.enableSourcemap = true;
  }
  const contents = generateEntryPoint(true, compilerOptions, segment);

  const stdin: esbuild.StdinOptions = {
    contents,
    loader: "js",
    resolveDir: basedir,
    sourcefile: "main.js",
  };

  // drop console.log and debugger in production
  const drop: Drop[] = isDev ? [] : ["console", "debugger"];

  // output is in memory, not file system
  const write = false;

  // server
  const result = await esbuild.build({
    ...buildOptions,
    write,
    //
    stdin,
    //
    outfile: "./ssr.js",
    drop,
    splitting: false,
    //
    plugins: [
      ...plugins,
      sveltePlugin({
        preprocess: sveltePreprocess(),
        compilerOptions,
      }),
    ],
  });

  // TODO: check for warnings
  const output = result.outputFiles[0].text;

  // const css = result.outputFiles[1].text;
  // console.log(css);

  return output;
};
