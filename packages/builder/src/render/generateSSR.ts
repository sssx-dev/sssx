import * as svelte from "svelte/compiler";
import esbuild, { Plugin, type BuildOptions } from "esbuild";
//@ts-ignore
import type { CompileOptions, Warning } from "svelte/types/compiler/interfaces";
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";

const defaultCompilerOptions: CompileOptions = {
  generate: "ssr",
  css: "injected",
  hydratable: true,
  // enableSourcemap: false, // gives Cannot read properties of null (reading 'sourcesContent') [plugin esbuild-svelte]
};

const getMainCode = () =>
  `<script lang="ts">
  import Layout from './+layout.svelte';
  import Page from './pages/+page.svelte';
</script>

<Layout>
  <Page/>
</Layout>
`;

export const generateSSR = async (
  basedir: string,
  entryPoint: string,
  outfile: string,
  buildOptions: BuildOptions = {},
  plugins: Plugin[] = [],
  compilerSSROptions: Partial<CompileOptions> = defaultCompilerOptions
) => {
  const compilerOptions = { ...defaultCompilerOptions, ...compilerSSROptions };

  const svelteCode = getMainCode();
  const { js } = svelte.compile(svelteCode, compilerOptions);

  // console.log("//////////////////////////////////////////////////////");
  // console.log(js);
  // console.log("//////////////////////////////////////////////////////");

  // console.log({ basedir });

  const stdin: esbuild.StdinOptions = {
    contents: js.code,
    loader: "js",
    resolveDir: basedir,
    sourcefile: "main.svelte",
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
