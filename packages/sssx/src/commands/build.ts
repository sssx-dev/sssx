import fs from "node:fs";
import colors from "ansi-colors";
import { buildRoute, getManifest, resetManifest } from "../render/index.ts";
import { getConfig } from "../config.ts";
import { getAllRoutes, routeToFileSystem } from "../routes/index.ts";
import { buildSitemap } from "../plugins/sitemap.ts";
import { buildRobots } from "../plugins/robots.ts";
import { buildRSS } from "../plugins/rss.ts";
import { build404 } from "../plugins/notFound.ts";
import { getRoute } from "../utils/getRoute.ts";
import { writeURLsIndex } from "../indexes/writeURLsIndex.ts";
import { writeFilesIndex } from "../indexes/writeFilesIndex.ts";
import { cwd } from "../utils/cwd.ts";
import { args } from "../utils/args.ts";
import { done } from "../utils/done.ts";
import { Timer } from "../utils/timer.ts";
import { validateRoutes, printValidationWarnings } from "../routes/validate.ts";
import { reportBuildSize } from "../utils/fileSize.ts";
import { runHook, type BuildContext } from "../plugins/types.ts";

const { dim, green, red, bold } = colors;

const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = false;

if (fs.existsSync(outdir)) {
  fs.rmSync(outdir, { recursive: true, force: true });
}
fs.mkdirSync(outdir);

resetManifest();

const plugins = config.plugins || [];
const allRoutes = await getAllRoutes(cwd, config);

// Validate routes
const routeWarnings = validateRoutes(allRoutes);
printValidationWarnings(routeWarnings);

const routes = allRoutes.map((s) => s.permalink);

// generate sitemap.xml and robots.txt
await buildSitemap(outdir, config, allRoutes);
buildRobots(outdir, config);
if (config.rss !== false) buildRSS(outdir, config, allRoutes);
if (config.generate404 !== false) build404(outdir, config);

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

for (let i = startIndex; i < length; i++) {
  const url = routes[i];
  const routeTimer = new Timer();
  try {
    const route = getRoute(url);
    const segment = await routeToFileSystem(cwd, route, allRoutes);
    if (!segment) {
      console.warn(dim(`  ⚠ No segment for "${url}", skipping.`));
      continue;
    }
    await buildRoute(route, segment, outdir, cwd, config, isDev, undefined, plugins);
    builtCount++;
    console.log(dim(`  ${green("✓")} ${url}`) + dim(` (${routeTimer.format()})`));
  } catch (err) {
    console.error(red(`  ✗ ${url}: ${err instanceof Error ? err.message : String(err)}`));
    failedRoutes.push({ url, error: err });
  }
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

// Plugin: onBuildEnd
await runHook(plugins, "onBuildEnd", buildCtx);

// order here is important
if (config.writeURLsIndex) await writeURLsIndex(cwd, routes);
if (config.writeFilesIndex) await writeFilesIndex(cwd, config);

await done();

if (failedRoutes.length > 0) {
  process.exitCode = 1;
}
