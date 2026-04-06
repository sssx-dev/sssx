import esbuild, { type Plugin, type BuildOptions, type Drop } from "esbuild";
import type { CompileOptions } from "svelte/compiler";
import sveltePlugin from "esbuild-svelte5";
import { sveltePreprocess } from "svelte-preprocess";
import { generateEntryPoint } from "./generateEntryPoint.ts";
import { type Config } from "../config.ts";
import { type RouteInfo } from "../routes/index.ts";

const DEFAULT_OUTPUT_FILENAME = "./ssr.js";

const defaultCompilerOptions: CompileOptions = {
  // @ts-ignore
  generate: "server",
  css: "external",
};

export const generateSSR = async (
  config: Config,
  basedir: string,
  segment: RouteInfo,
  buildOptions: BuildOptions = {},
  inputPlugins: Plugin[] = [],
  compilerSSROptions: Partial<CompileOptions> = {},
  isDev: boolean,
  outfile = DEFAULT_OUTPUT_FILENAME
) => {
  const compilerOptions: CompileOptions = {
    ...defaultCompilerOptions,
    ...compilerSSROptions,
  };
  if (isDev) {
    compilerOptions.dev = isDev;
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
  const splitting = false;

  const plugins: Plugin[] = [
    ...inputPlugins,
    sveltePlugin({
      preprocess: sveltePreprocess(),
      compilerOptions,
    }),
  ] as any[];

  // server
  const result = await esbuild.build({
    ...buildOptions,
    write,
    stdin,
    outfile,
    drop,
    splitting,
    plugins,
  });

  if (result.warnings.length > 0) {
    for (const warning of result.warnings) {
      console.warn(`[esbuild warning] ${warning.text}`);
    }
  }

  const output = result.outputFiles[0].text;
  return output;
};
