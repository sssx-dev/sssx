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

const app = express();

const cwd = process.cwd();

const outdir = `${cwd}/dev`;
const ssrFile = `${outdir}/ssr.js`;

rimraf(outdir);

let plugins: Plugin[] = [];

// const imagesRegExp = /^(.*\.(?!(svg|png|jpeg|jpg|webp)$))?[^.]*$/i;
const imagesRegExp = /^.*\.(svg|png|jpeg|jpg|webp)$/;
// const imagesRegExp = /\.svg$/

// TOOD: remember to generate ambient types for svelte here
let resolveImages = (copyAssets = false): Plugin => ({
  name: "resolveImages",
  setup(build) {
    const namespace = "images-namespace";
    build.onResolve({ filter: imagesRegExp }, (args) => {
      //   console.log(`onResolve`, args);

      // TODO: this would be the place to introduce hashing hash/original_name.jpeg
      if (copyAssets) {
        const srcDir = path.dirname(args.importer);
        const src = path.normalize(`${srcDir}/${args.path}`);
        const dst = path.normalize(`${outdir}/${args.path}`);
        const dir = path.dirname(dst);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.copyFileSync(src, dst);
      }

      return {
        path: args.path,
        namespace,
      };
    });

    build.onLoad({ filter: /.*/, namespace }, (args) => {
      //   console.log(`onLoad`, args);

      return {
        contents: args.path,
        loader: "text",
      };
    });
  },
});

const common = getCommonBuildOptions(`./src/main.ts`);
await generateSSR(`${cwd}/src/App.svelte`, ssrFile, common, [
  resolveImages(true),
]);
await renderSSR(ssrFile, outdir);
await generateClient(outdir, common, {}, [resolveImages()]);

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
