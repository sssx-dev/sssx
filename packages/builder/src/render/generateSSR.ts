import esbuild, { type BuildOptions } from "esbuild";
//@ts-ignore
import type { CompileOptions, Warning } from "svelte/types/compiler/interfaces";
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";

const defaultCompilerOptions: CompileOptions = {
  generate: "ssr",
  css: "injected",
  hydratable: true,
  enableSourcemap: false,
};

export const generateSSR = async (
  entryPoint = `./src/App.svelte`,
  outfile: string,
  buildOptions: BuildOptions = {},
  compilerSSROptions: Partial<CompileOptions> = defaultCompilerOptions
) => {
  const compilerOptions = { ...defaultCompilerOptions, ...compilerSSROptions };

  // server
  await esbuild
    .build({
      ...buildOptions,
      entryPoints: [entryPoint],
      //
      outfile,
      splitting: false,
      //
      plugins: [
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
