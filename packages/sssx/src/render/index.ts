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

const CLEAR_OUT_FOLDER = true;

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

  if (segment) {
    let props = segment.param;

    if (segment.type === "filesystem" && !segment.module) {
      // Load module when not loaded (e.g. in worker context)
      const module: RouteModule = await import(segment.file);
      props = module.request(segment.param);
    }

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
