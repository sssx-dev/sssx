import fs from "fs";
import { resolveImages } from "../plugins/resolveImages";
import { copyAssets } from "../utils/assets";
import { Config, getConfig } from "../utils/config";
import { getRoute } from "../utils/getRoute";
import { rimraf } from "../utils/rimraf";
import { getCommonBuildOptions } from "../utils/settings";
import { generateClient } from "./generateClient";
import { generateSSR } from "./generateSSR";
import { renderSSR } from "./renderSSR";
import { routeToFileSystem } from "./routes";

export const buildRoute = async (
  url: string,
  outdir: string,
  cwd: string,
  config: Config,
  isDev: boolean
) => {
  const base = `${cwd}/src/`;
  const route = getRoute(url);
  const rand = Math.random().toString().slice(2);
  const ssrFile = `${outdir}/ssr.${rand}.js`;
  const isRoot = route === "/";

  // march route coming from dev server like /some/slug/ into a segment
  // that gives address of the route in the file system like /some/(group)/[slug]/+page.svelte
  const segment = await routeToFileSystem(`${base}pages/`, route);
  // console.log({ segment });

  if (segment) {
    const props = segment.module
      ? segment.module.request(segment.param)
      : segment.param;
    // console.log({ props });

    // creating this inside outdir
    if (!isRoot) outdir += route;

    if (!fs.existsSync(outdir)) {
      fs.mkdirSync(outdir, { recursive: true });
    }

    if (isDev) {
      rimraf(outdir);
    }

    const common = getCommonBuildOptions();
    await generateSSR(
      base,
      segment.route,
      ssrFile,
      common,
      [resolveImages(outdir, true)],
      {},
      isDev
    );
    await renderSSR(ssrFile, outdir, props, config.title);
    await generateClient(
      base,
      segment.route,
      outdir,
      common,
      {},
      [resolveImages(outdir)],
      props,
      isDev
    );
  }

  // copy public folder
  if (isRoot) {
    await copyAssets(outdir, cwd, config);
  }
};
