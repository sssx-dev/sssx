import esbuild, { BuildOptions, Plugin } from "esbuild";
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
//@ts-ignore
import type { CompileOptions, Warning } from "svelte/types/compiler/interfaces";

const defaultCompilerOptions: CompileOptions = {
  // css: 'none',
  hydratable: true,
};

const getMainCode = (svelte = `App.svelte`, css = `app.css`, hydrate = true) =>
  `import "./${css}";
import App from "./${svelte}";

const app = new App({
  target: document.getElementById("app")!,
  hydrate: ${hydrate},
});

export default app;
`;

export const generateClient = async (
  basedir: string,
  entryPoint: string,
  outdir: string,
  buildOptions: BuildOptions = {},
  compilerOptions: Partial<CompileOptions> = defaultCompilerOptions,
  plugins: Plugin[] = []
) => {
  compilerOptions = { ...defaultCompilerOptions, ...compilerOptions };

  await esbuild
    .build({
      ...buildOptions,
      ///
      stdin: {
        contents: getMainCode(entryPoint),
        loader: "ts",
        resolveDir: basedir, //".",
      },
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
