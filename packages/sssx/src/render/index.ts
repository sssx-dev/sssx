import fs from "node:fs";
import path from "node:path";
import { resolveImages } from "../plugins/resolveImages.ts";
import { copyAssets, copyPublicAssets } from "../utils/assets.ts";
import { type Config } from "../config.ts";
import { rimraf } from "../utils/rimraf.ts";
import { getCommonBuildOptions } from "../utils/settings.ts";
import { generateClient } from "./generateClient.ts";
import { generateSSR } from "./generateSSR.ts";
import { renderSSR } from "./renderSSR.ts";
import { type RouteInfo } from "../routes/index.ts";
import { type Plugin } from "esbuild";
import { markdown } from "../utils/markdown.ts";
import type { RouteModule } from "../routes/types.ts";

// TODO: change back to true before publish
const CLEAR_OUT_FOLDER = false;

export const buildRoute = async (
  route: string,
  segment: RouteInfo,
  outdir: string,
  cwd: string,
  config: Config,
  isDev: boolean,
  devSite?: string
) => {
  const base = `${cwd}/src/`;
  const isRoot = route === "/";

  // match route coming from dev server like /some/slug/ into a segment
  // that gives address of the route in the file system like /some/(group)/[slug]/+page.svelte
  // console.log({ segment });

  if (segment) {
    let props = segment.param;

    if (segment.type === "filesystem" && !segment.module) {
      // load modules again, if not loaded from before
      // like when this is executed in the worker
      const module: RouteModule = await import(segment.file);
      props = module.request(segment.param);
    }

    // console.log({ props });

    // creating this inside outdir
    if (!isRoot) outdir += route;

    if (segment.file.endsWith(".md")) {
      const html = await markdown(segment.file, config);
      const srcDir = path.dirname(segment.file);
      copyAssets(srcDir, outdir);
      props.html = html;
    }

    if (!fs.existsSync(outdir)) {
      fs.mkdirSync(outdir, { recursive: true });
    }

    if (isDev && CLEAR_OUT_FOLDER) {
      rimraf(outdir);
    }

    let plugins: Plugin[] = [];

    // make it silent in a production build
    const common = getCommonBuildOptions(isDev ? "info" : "silent");
    const ssrOutput = await generateSSR(
      config,
      base,
      segment,
      common,
      [...plugins, resolveImages(outdir, config, true)],
      {},
      isDev
    );
    const tmpPath = `${outdir}/ssr.js`;
    fs.writeFileSync(`${outdir}/ssr.js`, ssrOutput, "utf8");
    // await renderSSR(ssrOutput, outdir, props, segment, config, devSite);
    await renderSSR(
      ssrOutput,
      outdir,
      props,
      segment,
      config,
      devSite,
      false,
      true,
      true,
      tmpPath
    );
    await generateClient(
      config,
      base,
      segment,
      outdir,
      common,
      {},
      [...plugins, resolveImages(outdir, config, false)],
      props,
      isDev
    );
  }

  // copy public folder
  if (isRoot) {
    await copyPublicAssets(outdir, cwd, config);
  }
};
