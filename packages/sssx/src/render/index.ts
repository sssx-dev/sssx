import fs from "node:fs";
import fsp from "node:fs/promises";
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
import { type Plugin as EsbuildPlugin } from "esbuild";
import { markdown } from "../utils/markdown.ts";
import type { RouteModule } from "../routes/types.ts";
import { AssetManifest } from "./assetManifest.ts";
import { type SSSXPlugin, runHook, type RouteContext } from "../plugins/types.ts";
import { type ImageMap, getImagesForRoute } from "../plugins/imagePipeline.ts";

const CLEAR_OUT_FOLDER = true;

/** Shared asset manifest — created once per build, reused across routes */
let _manifest: AssetManifest | null = null;

export const getManifest = (outdir: string): AssetManifest => {
  if (!_manifest) {
    _manifest = new AssetManifest(outdir);
  }
  return _manifest;
};

export const resetManifest = () => {
  _manifest = null;
};

export const buildRoute = async (
  route: string,
  segment: RouteInfo,
  outdir: string,
  cwd: string,
  config: Config,
  isDev: boolean,
  devSite?: string,
  sssxPlugins: SSSXPlugin[] = [],
  imageMap?: ImageMap
) => {
  const base = `${cwd}/src/`;
  const isRoot = route === "/";
  const rootOutdir = outdir;

  if (segment) {
    let props = segment.param;

    if (segment.type === "filesystem" && !segment.module) {
      // Load module when not loaded (e.g. in worker context)
      const module: RouteModule = await import(segment.file);
      props = module.request(segment.param);
    }

    if (!isRoot) outdir += route;

    if (segment.file.endsWith(".md")) {
      const html = await markdown(segment.file, config, imageMap);
      const srcDir = path.dirname(segment.file);
      copyAssets(srcDir, outdir);
      props.html = html;
    }

    // Attach route-specific images from image map
    if (imageMap) {
      const routeImages = getImagesForRoute(segment.file, imageMap);
      if (routeImages.length > 0) {
        props._images = routeImages;
      }
    }

    if (!fs.existsSync(outdir)) {
      fs.mkdirSync(outdir, { recursive: true });
    }

    if (isDev && CLEAR_OUT_FOLDER) {
      rimraf(outdir);
    }

    const esbuildPlugins: EsbuildPlugin[] = [];
    const common = getCommonBuildOptions(isDev ? "info" : "silent");

    let jsPath = "./main.js";
    let cssPath = "./main.css";

    const ssrResult = await generateSSR(
      config,
      base,
      segment,
      common,
      [...esbuildPlugins, resolveImages(outdir, config, true)],
      {},
      isDev
    );
    const ssrOutput = ssrResult.js;
    const tmpPath = `${outdir}/ssr.js`;
    await fsp.writeFile(tmpPath, ssrOutput, "utf8");

    // Handle CSS — deduplicate via asset manifest in production
    if (ssrResult.css && !isDev) {
      const manifest = getManifest(rootOutdir);
      const cssEntry = manifest.register(ssrResult.css, "css");
      cssPath = cssEntry.publicPath;
    } else if (ssrResult.css) {
      await fsp.writeFile(`${outdir}/main.css`, ssrResult.css, "utf8");
    }

    if (!isDev) {
      // In production, externalize props so client bundles can be deduplicated
      const clientOutput = await generateClient(
        config,
        base,
        segment,
        outdir,
        common,
        {},
        [...esbuildPlugins, resolveImages(outdir, config, false)],
        props,
        isDev,
        true,
        true // externalizeProps
      );

      if (clientOutput) {
        const manifest = getManifest(rootOutdir);
        const jsEntry = manifest.register(clientOutput, "js");
        jsPath = jsEntry.publicPath;
      }
    }

    // Run plugin before-route hook
    const routeCtx: RouteContext = { config, cwd, outdir: rootOutdir, routes: [], route, segment, props };
    await runHook(sssxPlugins, "onBeforeRoute", routeCtx);

    await renderSSR({
      js: ssrOutput,
      outdir,
      props,
      segment,
      config,
      devSite,
      noJS: false,
      prettify: true,
      includeCSS: true,
      inputPath: tmpPath,
      jsPath,
      cssPath,
      plugins: sssxPlugins,
      externalizeProps: !isDev,
    });

    // Run plugin after-route hook
    await runHook(sssxPlugins, "onAfterRoute", routeCtx);

    // Clean up SSR temp file in production
    if (!isDev) {
      fsp.unlink(tmpPath).catch(() => {});
    }

    // In dev mode, still generate client per-route
    if (isDev) {
      await generateClient(
        config,
        base,
        segment,
        outdir,
        common,
        {},
        [...esbuildPlugins, resolveImages(outdir, config, false)],
        props,
        isDev,
        false
      );
    }
  }

  // copy public folder
  if (isRoot) {
    await copyPublicAssets(outdir, cwd, config);
  }
};
