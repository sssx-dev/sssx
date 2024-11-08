import esbuild, { type BuildOptions, type Plugin } from "esbuild";
import sveltePlugin from "esbuild-svelte5";
import type { CompileOptions } from "svelte/compiler";
import { generateEntryPoint } from "./generateEntryPoint.ts";
import { type Config } from "../config.ts";
import { type RouteInfo } from "../routes/index.ts";

const CLIENT_OUT_FILE = "main.js";
const MINIFY = false;

const defaultCompilerOptions: CompileOptions = {
  accessors: true,
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

  const outfile = [outdir, CLIENT_OUT_FILE].join("/");

  const result = await esbuild.build({
    ...buildOptions,
    stdin,
    outfile,
    splitting: false,
    minify: MINIFY,
    plugins,
  });
};
