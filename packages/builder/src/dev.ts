import copyPlugin from "esbuild-plugin-copy";
import { generateSSR } from "./render/generateSSR";
import { renderSSR } from "./render/renderSSR";
import { rimraf } from "./utils/rimraf";
import { getCommonBuildOptions } from "./utils/settings";
import { generateClient } from "./render/generateClient";
import express from "express";
import open from "open";

const app = express();

const cwd = process.cwd();

const outdir = `${cwd}/dev`;
const ssrFile = `${outdir}/ssr.js`;

rimraf(outdir);

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

app.use(express.static(outdir));
const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const host = "127.0.0.1";

app.listen(port, host, () => {
  console.log(`Listening on port ${port}`);
  open(`http://${host}:${port}`);
});
