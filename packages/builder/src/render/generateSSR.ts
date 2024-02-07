import esbuild, { Plugin, type BuildOptions } from "esbuild";
//@ts-ignore
import type { CompileOptions, Warning } from "svelte/types/compiler/interfaces";
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import { generateEntryPoint } from "./generateEntryPoint";

const defaultCompilerOptions: CompileOptions = {
  generate: "ssr",
  css: "injected",
  hydratable: true,
  // enableSourcemap: false, // gives Cannot read properties of null (reading 'sourcesContent') [plugin esbuild-svelte]
};

// TODO: improve this, because it also generates ssr.css, but client side generates main.css instead later.
export const generateSSR = async (
  basedir: string,
  route: string,
  outfile: string,
  buildOptions: BuildOptions = {},
  plugins: Plugin[] = [],
  compilerSSROptions: Partial<CompileOptions> = defaultCompilerOptions
) => {
  const compilerOptions = { ...defaultCompilerOptions, ...compilerSSROptions };

  const contents = generateEntryPoint(true, compilerOptions, route);

  const stdin: esbuild.StdinOptions = {
    contents,
    loader: "js",
    resolveDir: basedir,
    sourcefile: "main.js",
  };

  // server
  await esbuild
    .build({
      ...buildOptions,
      //
      stdin,
      //
      outfile,
      splitting: false,
      //
      plugins: [
        ...plugins,
        sveltePlugin({
          preprocess: sveltePreprocess(),
          compilerOptions,
        }),
      ],
    })
    .catch((reason: any) => {
      console.warn(`Errors: `, reason);
      process.exit(1);
    });
};
