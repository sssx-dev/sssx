import esbuild, { BuildOptions, Plugin } from "esbuild";
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
//@ts-ignore
import type { CompileOptions, Warning } from "svelte/types/compiler/interfaces";
import { generateEntryPoint } from "./generateEntryPoint";
import { minify } from "../utils/settings";
import { Config } from "../config";
import { RouteInfo } from "../routes";

const defaultCompilerOptions: CompileOptions = {
  // css: "none",
  hydratable: true,
};

export const generateClient = async (
  config: Config,
  basedir: string,
  segment: RouteInfo,
  outdir: string,
  buildOptions: BuildOptions = {},
  compilerClientOptions: Partial<CompileOptions> = {},
  plugins: Plugin[] = [],
  props: Record<string, any> = {},
  isDev: boolean
) => {
  const compilerOptions: CompileOptions = {
    ...defaultCompilerOptions,
    ...compilerClientOptions,
  };

  if (isDev) {
    compilerOptions.dev = isDev;
  }

  const stdin: esbuild.StdinOptions = {
    contents: generateEntryPoint(false, compilerOptions, segment, props),
    loader: "ts",
    resolveDir: basedir, //".",
    sourcefile: "main.ts",
  };

  await esbuild.build({
    ...buildOptions,
    ///
    stdin,
    ///
    // sourcemap,
    outfile: `${outdir}/main.js`,
    splitting: false,
    // minify: true,
    minify: false,
    plugins: [
      ...plugins,
      sveltePlugin({
        preprocess: sveltePreprocess({
          // postcss: config.postcss,
          // configFilePath: basedir,
        }),
        compilerOptions,
      }),
    ],
  });
};
