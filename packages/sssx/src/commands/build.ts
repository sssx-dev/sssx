import fs from "node:fs";
import colors from "ansi-colors";
import { buildRoute, getManifest, resetManifest } from "../render/index.ts";
import { getConfig } from "../config.ts";
import { getAllRoutes, routeToFileSystem } from "../routes/index.ts";
import { buildSitemap } from "../plugins/sitemap.ts";
import { buildRobots } from "../plugins/robots.ts";
import { buildRSS } from "../plugins/rss.ts";
import { build404 } from "../plugins/notFound.ts";
import { buildHeaders } from "../plugins/hosting.ts";
import { processContentImages, writeImageMap } from "../plugins/imagePipeline.ts";
import { getRoute } from "../utils/getRoute.ts";
import { writeURLsIndex } from "../indexes/writeURLsIndex.ts";
import { writeFilesIndex } from "../indexes/writeFilesIndex.ts";
import { cwd } from "../utils/cwd.ts";
import { args, flags } from "../utils/args.ts";
import { done } from "../utils/done.ts";
import { Timer } from "../utils/timer.ts";
import { validateRoutes, printValidationWarnings } from "../routes/validate.ts";
import { reportBuildSize } from "../utils/fileSize.ts";
import { runHook, type BuildContext } from "../plugins/types.ts";
import { initEsbuild, disposeEsbuild } from "../render/esbuildContext.ts";
import { formatBuildError } from "../utils/errors.ts";
import { writeBuildManifest } from "../plugins/buildManifest.ts";
import { validateConfig, printConfigWarnings } from "../utils/configValidation.ts";
import { createProgressBar } from "../utils/createProgressBar.ts";
import { buildSearchIndex } from "../plugins/search.ts";
import { filterContentRoutes, printFilterStats } from "../plugins/contentFilters.ts";
import { collectRedirects, writeRedirectsFile, writeRedirectPages } from "../plugins/redirects.ts";
import { checkLinks, printBrokenLinks } from "../plugins/linkChecker.ts";
import { compressOutput, printCompressStats } from "../plugins/compress.ts";
import { computeDeployDiff } from "../plugins/deployDiff.ts";

const { dim, green, red, bold } = colors;

const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = false;

if (fs.existsSync(outdir)) {
  fs.rmSync(outdir, { recursive: true, force: true });
}
fs.mkdirSync(outdir);

resetManifest();
await initEsbuild();

// Validate config
const configWarnings = validateConfig(config);
printConfigWarnings(configWarnings);

const plugins = config.plugins || [];
const allRoutesRaw = await getAllRoutes(cwd, config);

// Filter drafts, scheduled, expired content
const filterResult = filterContentRoutes(allRoutesRaw, isDev);
printFilterStats(filterResult);
const allRoutes = filterResult.included;

// Validate routes
const routeWarnings = validateRoutes(allRoutes);
printValidationWarnings(routeWarnings);

const routes = allRoutes.map((s) => s.permalink);

// generate sitemap.xml and robots.txt
await buildSitemap(outdir, config, allRoutes);
buildRobots(outdir, config);
if (config.rss !== false) buildRSS(outdir, config, allRoutes);
if (config.generate404 !== false) build404(outdir, config);
buildHeaders(outdir, config);

// Process content images
const contentDir = `${cwd}/src/content`;
let imageMap = { images: {} as Record<string, any> };
if (fs.existsSync(contentDir)) {
  imageMap = await processContentImages(contentDir, outdir, config);
  writeImageMap(outdir, imageMap);
  const imgCount = Object.keys(imageMap.images).length;
  if (imgCount > 0) {
    console.log(dim(`  Processed ${imgCount} content images`));
  }
}

// Plugin: onBuildStart
const buildCtx: BuildContext = { config, cwd, outdir, routes: allRoutes };
await runHook(plugins, "onBuildStart", buildCtx);

let startIndex = 0;
let length = routes.length;
const inputRoute = args[0];
const inputRouteIndex = routes.indexOf(inputRoute);

// process only single input URL if any
if (inputRouteIndex >= 0) {
  startIndex = inputRouteIndex;
  length = startIndex + 1;
}

let failedRoutes: Array<{ url: string; error: unknown }> = [];
let builtCount = 0;

const totalToBuild = length - startIndex;
const useProgressBar = totalToBuild > 20 && !flags.has("verbose");
const bar = useProgressBar ? createProgressBar() : null;

if (bar) {
  bar.start(totalToBuild, 0, { url: "", total: 0 });
}

for (let i = startIndex; i < length; i++) {
  const url = routes[i];
  const routeTimer = new Timer();
  try {
    const route = getRoute(url);
    const segment = await routeToFileSystem(cwd, route, allRoutes);
    if (!segment) {
      if (!bar) console.warn(dim(`  ⚠ No segment for "${url}", skipping.`));
      continue;
    }
    await buildRoute(route, segment, outdir, cwd, config, isDev, undefined, plugins);
    builtCount++;
    if (bar) {
      bar.update(builtCount, { url, total: builtCount });
    } else {
      console.log(dim(`  ${green("✓")} ${url}`) + dim(` (${routeTimer.format()})`));
    }
  } catch (err) {
    if (bar) bar.stop();
    console.error(formatBuildError(err, url));
    if (bar) bar.start(totalToBuild, builtCount, { url: "", total: builtCount });
    failedRoutes.push({ url, error: err });
  }
}

if (bar) {
  bar.update(totalToBuild);
  bar.stop();
}

// Write asset manifest
const manifest = getManifest(outdir);
manifest.writeManifest();
const stats = manifest.stats();

console.log("");
console.log(bold(`  Build Summary`));
console.log(dim(`  Routes built:   ${green(String(builtCount))}`));
if (stats.uniqueAssets > 0) {
  console.log(dim(`  Unique bundles: ${stats.uniqueAssets} (${stats.saved} deduplicated)`));
}

if (failedRoutes.length > 0) {
  console.error(red(`  Failed:         ${failedRoutes.length}`));
  for (const { url, error } of failedRoutes) {
    console.error(red(`    - ${url}: ${error instanceof Error ? error.message : String(error)}`));
  }
}

await reportBuildSize(outdir);
await writeBuildManifest(outdir, config, allRoutes);

// Search index
if (config.search !== false) {
  buildSearchIndex(outdir, config, allRoutes);
  console.log(dim(`  Search index:   ${allRoutes.length} pages indexed`));
}

// Redirects
const redirects = collectRedirects(allRoutes, cwd);
if (redirects.length > 0) {
  writeRedirectsFile(outdir, redirects);
  writeRedirectPages(outdir, redirects);
  console.log(dim(`  Redirects:      ${redirects.length}`));
}

// Broken link check
if (config.checkLinks) {
  const broken = checkLinks(outdir);
  printBrokenLinks(broken);
}

// Pre-compression
if (config.compress) {
  const compressStats = compressOutput(outdir);
  printCompressStats(compressStats);
}

// Deploy diff
if (config.deployDiff) {
  const diff = computeDeployDiff(cwd, outdir);
  console.log(dim(`  Deploy diff:    ${diff.upload.length} to upload, ${diff.delete.length} to delete, ${diff.unchanged} unchanged`));
}

// Plugin: onBuildEnd
await runHook(plugins, "onBuildEnd", buildCtx);

// order here is important
if (config.writeURLsIndex) await writeURLsIndex(cwd, routes);
if (config.writeFilesIndex) await writeFilesIndex(cwd, config);

await disposeEsbuild();
await done();

if (failedRoutes.length > 0) {
  process.exitCode = 1;
}
