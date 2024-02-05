import fs from "fs";
import * as fsExtra from "fs-extra";
import esbuild, { type BuildOptions, type Plugin } from "esbuild";
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import copyPlugin from "esbuild-plugin-copy";
import { generateSSR } from "./render/generateSSR";
import { renderSSR } from "./render/renderSSR";
import { rimraf } from "./utils/rimraf";
import { getCommonBuildOptions } from "./utils/settings";

const cwd = process.cwd();

const outdir = `${cwd}/dev`;
const finalOutdir = `${cwd}/dist`;
const ssrFile = `${outdir}/ssr.js`;

rimraf(outdir);
rimraf(finalOutdir);

const copyPlugins = [
  copyPlugin({
    resolveFrom: "cwd",
    assets: {
      from: ["./public/*"],
      to: [outdir],
    },
  }),
  // not the best way to deal with the images
  copyPlugin({
    resolveFrom: "cwd",
    assets: {
      from: ["./src/**/*.svg"],
      to: [outdir],
    },
  }),
];

const common = getCommonBuildOptions(`./src/main.ts`);

await generateSSR(`./src/App.svelte`, ssrFile, common);
await renderSSR(ssrFile, outdir);

// client
await esbuild
  .build({
    ...common,
    // sourcemap,
    outfile: `${outdir}/main.js`,
    splitting: false,
    minify: true,
    plugins: [
      ...copyPlugins,
      sveltePlugin({
        preprocess: sveltePreprocess(),
        compilerOptions: {
          // css: 'none',
          hydratable: true,
        },
      }),
    ],
  })
  .catch((reason) => {
    console.warn(`Errors: `, reason);
    process.exit(1);
  });

fs.cpSync(outdir, finalOutdir, { recursive: true });

// add dev mode and SSR mode (same but sourcemap + debugging HMR injection)
// add static build (URL by URL)
