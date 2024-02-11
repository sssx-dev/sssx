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
import { RouteInfo, routeToFileSystem } from "./routes";
import stylePlugin from "esbuild-style-plugin";
import { type Plugin } from "esbuild";
import { markdown } from "../utils/markdown";

export const buildRoute = async (
  route: string,
  segment: RouteInfo,
  outdir: string,
  cwd: string,
  config: Config,
  isDev: boolean
) => {
  const base = `${cwd}/src/`;
  // const route = getRoute(url);
  const isRoot = route === "/";

  // march route coming from dev server like /some/slug/ into a segment
  // that gives address of the route in the file system like /some/(group)/[slug]/+page.svelte
  // const segment = await routeToFileSystem(cwd, route);
  // console.log({ segment });

  if (segment) {
    let props = segment.module
      ? segment.module.request(segment.param)
      : segment.param;

    if (segment.file.endsWith(".md")) {
      const html = await markdown(segment.file);
      props.html = html;
    }
    // console.log({ props });

    // creating this inside outdir
    if (!isRoot) outdir += route;

    if (!fs.existsSync(outdir)) {
      fs.mkdirSync(outdir, { recursive: true });
    }

    if (isDev) {
      rimraf(outdir);
    }

    let plugins: Plugin[] = [];

    if (config.postcss.plugins) {
      const postcss = stylePlugin({
        postcss: {
          plugins: config.postcss.plugins!,
        },
      });
      plugins.push(postcss);
    }

    // make it silent in a production build
    const common = getCommonBuildOptions(isDev ? "info" : "silent");
    const ssrOutput = await generateSSR(
      config,
      base,
      segment,
      common,
      [...plugins, resolveImages(outdir, true)],
      {},
      isDev
    );
    // fs.writeFileSync(`${outdir}/ssr.js`, ssrOutput, "utf8");
    await renderSSR(ssrOutput, outdir, props, config.title);
    await generateClient(
      config,
      base,
      segment,
      outdir,
      common,
      {},
      [...plugins, resolveImages(outdir)],
      props,
      isDev
    );
  }

  // copy public folder
  if (isRoot) {
    await copyAssets(outdir, cwd, config);
  }
};
