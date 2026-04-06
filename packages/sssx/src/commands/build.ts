import fs from "node:fs";
import { buildRoute } from "../render/index.ts";
import { getConfig } from "../config.ts";
import { getAllRoutes, routeToFileSystem } from "../routes/index.ts";
import { buildSitemap } from "../plugins/sitemap.ts";
import { getRoute } from "../utils/getRoute.ts";
import { writeURLsIndex } from "../indexes/writeURLsIndex.ts";
import { writeFilesIndex } from "../indexes/writeFilesIndex.ts";
import { cwd } from "../utils/cwd.ts";
import { args } from "../utils/args.ts";
import { done } from "../utils/done.ts";

const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = false;

if (fs.existsSync(outdir)) {
  fs.rmSync(outdir, { recursive: true, force: true });
}
fs.mkdirSync(outdir);

const allRoutes = await getAllRoutes(cwd, config);
const routes = allRoutes.map((s) => s.permalink);

// generate sitemap.xml for all routes without the filter
await buildSitemap(outdir, config, allRoutes);

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

for (let i = startIndex; i < length; i++) {
  const url = routes[i];
  console.log(i, `\t`, url);
  try {
    const route = getRoute(url);
    const segment = await routeToFileSystem(cwd, route, allRoutes);
    if (!segment) {
      console.warn(`Warning: No segment found for route "${url}", skipping.`);
      continue;
    }
    await buildRoute(route, segment, outdir, cwd, config, isDev);
  } catch (err) {
    console.error(`Error building route "${url}":`, err);
    failedRoutes.push({ url, error: err });
  }
}

if (failedRoutes.length > 0) {
  console.error(`\n${failedRoutes.length} route(s) failed to build:`);
  for (const { url, error } of failedRoutes) {
    console.error(`  - ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// order here is important
if (config.writeURLsIndex) await writeURLsIndex(cwd, routes);
if (config.writeFilesIndex) await writeFilesIndex(cwd, config);

await done();

if (failedRoutes.length > 0) {
  process.exitCode = 1;
}
