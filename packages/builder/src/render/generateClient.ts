import esbuild, { BuildOptions, Plugin } from "esbuild";
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
//@ts-ignore
import type { CompileOptions, Warning } from "svelte/types/compiler/interfaces";
import { generateEntryPoint } from "./generateEntryPoint";

const defaultCompilerOptions: CompileOptions = {
  // css: 'none',
  hydratable: true,
};

export const generateClient = async (
  basedir: string,
  entryPoint: string,
  outdir: string,
  buildOptions: BuildOptions = {},
  compilerOptions: Partial<CompileOptions> = defaultCompilerOptions,
  plugins: Plugin[] = []
) => {
  compilerOptions = { ...defaultCompilerOptions, ...compilerOptions };

  const stdin: esbuild.StdinOptions = {
    contents: generateEntryPoint(false, compilerOptions),
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
      minify: true,
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
