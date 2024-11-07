import esbuild, { type BuildOptions, type Plugin } from "esbuild";
import sveltePlugin from "esbuild-svelte5";
import sveltePreprocess from "svelte-preprocess";
import type { CompileOptions, Warning } from "svelte/compiler";
import { generateEntryPoint } from "./generateEntryPoint.ts";
import { minify } from "../utils/settings.ts";
import { type Config } from "../config.ts";
import { type RouteInfo } from "../routes/index.ts";

const defaultCompilerOptions: CompileOptions = {
  hydratable: true,
};

export const generateClient = async (
  config: Config,
  basedir: string,
  segment: RouteInfo,
  outdir: string,
  buildOptions: BuildOptions = {},
  compilerClientOptions: Partial<CompileOptions> = {},
  newPlugins: Plugin[] = [],
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

  const contents = generateEntryPoint(false, compilerOptions, segment, props);

  console.log("==================");
  console.log(contents);
  console.log("==================");

  const stdin: esbuild.StdinOptions = {
    contents,
    loader: "ts",
    resolveDir: basedir, //".",
    sourcefile: "main.ts",
  };

  const plugins: Plugin[] = [
    ...newPlugins,
    sveltePlugin({ compilerOptions }),
  ] as any[];

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
    plugins,
  });
};
