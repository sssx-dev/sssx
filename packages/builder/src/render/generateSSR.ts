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

export const generateSSR = async (
  basedir: string,
  entryPoint: string,
  outfile: string,
  buildOptions: BuildOptions = {},
  plugins: Plugin[] = [],
  compilerSSROptions: Partial<CompileOptions> = defaultCompilerOptions
) => {
  const compilerOptions = { ...defaultCompilerOptions, ...compilerSSROptions };

  const contents = generateEntryPoint(true, compilerOptions);

  // console.log("//////////////////////////////////////////////////////");
  // console.log(contents);
  // console.log("//////////////////////////////////////////////////////");

  // console.log({ basedir });

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
      // entryPoints: [`${basedir}/${entryPoint}`],
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
