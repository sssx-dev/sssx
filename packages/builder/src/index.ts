import fs from "fs";
import copyPlugin from "esbuild-plugin-copy";
import { generateSSR } from "./render/generateSSR";
import { renderSSR } from "./render/renderSSR";
import { rimraf } from "./utils/rimraf";
import { getCommonBuildOptions } from "./utils/settings";
import { generateClient } from "./render/generateClient";

const cwd = process.cwd();

const outdir = `${cwd}/dev`;
const finalOutdir = `${cwd}/dist`;
const ssrFile = `${outdir}/ssr.js`;

rimraf(outdir);
rimraf(finalOutdir);

// this should become a proper esbuild plugin
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

await generateSSR(`${cwd}/src/App.svelte`, ssrFile, common);
await renderSSR(ssrFile, outdir);
await generateClient(outdir, common, {}, copyPlugins);

// fs.cpSync(outdir, finalOutdir, { recursive: true });

// add dev mode and SSR mode (same but sourcemap + debugging HMR injection)
// add static build (URL by URL)
