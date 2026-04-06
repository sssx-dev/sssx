import fs from "node:fs";
import colors from "ansi-colors";
import { buildRoute, getManifest, resetManifest } from "../render/index.ts";
import { getConfig } from "../config.ts";
import { getAllRoutes, routeToFileSystem } from "../routes/index.ts";
import { buildSitemap } from "../plugins/sitemap.ts";
import { buildRobots } from "../plugins/robots.ts";
import { buildRSS } from "../plugins/rss.ts";
import { buildHeaders } from "../plugins/hosting.ts";
import { getRoute } from "../utils/getRoute.ts";
import { cwd } from "../utils/cwd.ts";
import { done } from "../utils/done.ts";
import { Timer } from "../utils/timer.ts";
import { DependencyGraph } from "../indexes/dependencyGraph.ts";
import { hashContent } from "../utils/hashContent.ts";
import { reportBuildSize } from "../utils/fileSize.ts";
import { runHook, type BuildContext } from "../plugins/types.ts";

const { dim, green, red, bold, yellow, cyan } = colors;

const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = false;
const plugins = config.plugins || [];

// Ensure outdir exists
if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir, { recursive: true });
}

resetManifest();

// Load dependency graph from previous build
const depGraph = new DependencyGraph(cwd);

const allRoutes = await getAllRoutes(cwd, config);

// Build the graph from current routes
depGraph.buildFromRoutes(allRoutes);

// Detect changed files
const changedFiles = depGraph.getChangedFiles();

let routesToBuild: string[];

if (changedFiles.length === 0) {
  // First build or no changes detected — check if outdir is empty
  const hasBuiltFiles = fs.existsSync(outdir) && fs.readdirSync(outdir).length > 0;
  if (hasBuiltFiles) {
    console.log(dim("\n  No changes detected. Nothing to rebuild.\n"));
    depGraph.save();
    await done();
    process.exit(0);
  }
  // Full build
  routesToBuild = allRoutes.map((r) => r.permalink);
  console.log(bold(`\n  Full build — ${routesToBuild.length} routes\n`));
} else {
  // Differential build
  const affected = depGraph.getAffectedRoutes(changedFiles);
  routesToBuild = affected;

  console.log(bold(`\n  Differential build`));
  console.log(dim(`  Changed files:   ${changedFiles.length}`));
  changedFiles.forEach((f) => console.log(dim(`    ${yellow("~")} ${f}`)));
  console.log(dim(`  Affected routes: ${cyan(String(affected.length))}`));
  console.log("");
}

// Rebuild sitemap, robots, RSS for full route list
await buildSitemap(outdir, config, allRoutes);
buildRobots(outdir, config);
if (config.rss !== false) buildRSS(outdir, config, allRoutes);
buildHeaders(outdir, config);

// Plugin: onBuildStart
const buildCtx: BuildContext = { config, cwd, outdir, routes: allRoutes };
await runHook(plugins, "onBuildStart", buildCtx);

let failedRoutes: Array<{ url: string; error: unknown }> = [];
let builtCount = 0;

for (const url of routesToBuild) {
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

    // Record file in dependency graph
    const fileContent = fs.existsSync(segment.file) ? fs.readFileSync(segment.file, "utf8") : "";
    depGraph.recordFile(segment.file, hashContent(fileContent));

    console.log(dim(`  ${green("✓")} ${url}`) + dim(` (${routeTimer.format()})`));
  } catch (err) {
    console.error(red(`  ✗ ${url}: ${err instanceof Error ? err.message : String(err)}`));
    failedRoutes.push({ url, error: err });
  }
}

// Write asset manifest
const manifest = getManifest(outdir);
manifest.writeManifest();

// Save dependency graph for next build
depGraph.save();

// Summary
const stats = manifest.stats();
console.log("");
console.log(bold(`  Diff Build Summary`));
console.log(dim(`  Routes rebuilt:  ${green(String(builtCount))} / ${allRoutes.length} total`));
if (stats.uniqueAssets > 0) {
  console.log(dim(`  Unique bundles: ${stats.uniqueAssets} (${stats.saved} deduplicated)`));
}

if (failedRoutes.length > 0) {
  console.error(red(`  Failed:         ${failedRoutes.length}`));
}

await reportBuildSize(outdir);

// Plugin: onBuildEnd
await runHook(plugins, "onBuildEnd", buildCtx);

await done();

if (failedRoutes.length > 0) {
  process.exitCode = 1;
}
