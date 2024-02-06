import fs from "fs";
import path from "path";
import { generateSSR } from "./render/generateSSR";
import { renderSSR } from "./render/renderSSR";
import { rimraf } from "./utils/rimraf";
import { getCommonBuildOptions } from "./utils/settings";
import { generateClient } from "./render/generateClient";
import express from "express";
import open from "open";
import { Plugin } from "esbuild";
import { resolveImages } from "./plugins/resolveImages";

const app = express();

const cwd = process.cwd();

const outdir = `${cwd}/dev`;
const ssrFile = `${outdir}/ssr.js`;

rimraf(outdir);

const common = getCommonBuildOptions(`./src/main.ts`);
await generateSSR(`${cwd}/src/App.svelte`, ssrFile, common, [
  resolveImages(outdir, true),
]);
await renderSSR(ssrFile, outdir);
await generateClient(outdir, common, {}, [resolveImages(outdir)]);

// TODO: generate main.ts on the fly
// TODO: replace App.svelte based on the route pages/path, and later content
// TODO: add watch functionlaity and reload
// TODO: start looking into adding tailwind support

app.use(express.static(outdir));
const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const host = "127.0.0.1";

app.listen(port, host, () => {
  console.log(`Listening on port ${port}`);
  open(`http://${host}:${port}`);
});
