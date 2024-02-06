import fs from "fs";
import open from "open";
import express from "express";
import { generateSSR } from "./render/generateSSR";
import { renderSSR } from "./render/renderSSR";
import { rimraf } from "./utils/rimraf";
import { getCommonBuildOptions } from "./utils/settings";
import { generateClient } from "./render/generateClient";
import { resolveImages } from "./plugins/resolveImages";

const app = express();
const cwd = process.cwd();
const outdir = `${cwd}/dev`;
const ssrFile = `${outdir}/ssr.js`;
const base = `${cwd}/src`;

rimraf(outdir);

const common = getCommonBuildOptions();
await generateSSR(base, `App.svelte`, ssrFile, common, [
  resolveImages(outdir, true),
]);
await renderSSR(ssrFile, outdir);
await generateClient(base, `App.svelte`, outdir, common, {}, [
  resolveImages(outdir),
]);

// TODO: generate main.ts on the fly
// TODO: replace App.svelte based on the route pages/path, and later content
// TODO: add watch functionlaity and reload
// TODO: start looking into adding tailwind support
// TODO: always trailing slash policy

app.get("*", (req, res) => {
  const { url } = req;
  let filename = "index.html";
  if (url !== "/") {
    filename = url;
  }
  res.sendFile(`${outdir}/${filename}`);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const host = "127.0.0.1";

app.listen(port, host, () => {
  console.log(`Listening on port ${port}`);
  open(`http://${host}:${port}`);
});
