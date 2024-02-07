import esbuild, { BuildOptions, Plugin } from "esbuild";
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
//@ts-ignore
import type { CompileOptions, Warning } from "svelte/types/compiler/interfaces";
import { generateEntryPoint } from "./generateEntryPoint";
import { minify } from "../utils/settings";

const defaultCompilerOptions: CompileOptions = {
  // css: 'none',
  hydratable: true,
};

export const generateClient = async (
  basedir: string,
  route: string,
  outdir: string,
  buildOptions: BuildOptions = {},
  compilerOptions: Partial<CompileOptions> = defaultCompilerOptions,
  plugins: Plugin[] = [],
  props: Record<string, any> = {}
) => {
  compilerOptions = { ...defaultCompilerOptions, ...compilerOptions };

  const stdin: esbuild.StdinOptions = {
    contents: generateEntryPoint(false, compilerOptions, route, props),
    loader: "ts",
    resolveDir: basedir, //".",
    sourcefile: "main.ts",
  };

  await esbuild
    .build({
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
          preprocess: sveltePreprocess(),
          compilerOptions,
        }),
      ],
    })
    .catch((reason) => {
      console.warn(`Errors: `, reason);
      process.exit(1);
    });
};
