import fs from "node:fs";
import { buildRoute } from "../render";
import { getConfig } from "../config";
import { getAllRoutes, routeToFileSystem } from "../routes";
import { buildSitemap } from "../plugins/sitemap";
import { getRoute } from "../utils/getRoute";
import { writeURLsIndex } from "../indexes/writeURLsIndex";
import { writeFilesIndex } from "../indexes/writeFilesIndex";

const cwd = process.cwd();
const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = false;

if (fs.existsSync(outdir)) {
  fs.rmSync(outdir, { recursive: true, force: true });
}
fs.mkdirSync(outdir);

const allRoutes = await getAllRoutes(cwd, config);
const routes = allRoutes.map((s) => s.permalink);

// generate sitemap.xml
await buildSitemap(outdir, config, allRoutes);

let startIndex = 0;
let length = routes.length;
const inputRoute = process.argv[3];
const inputRouteIndex = routes.indexOf(inputRoute);

// process only single input URL if any
if (inputRouteIndex >= 0) {
  startIndex = inputRouteIndex;
  length = startIndex + 1;
}

for (let i = startIndex; i < length; i++) {
  const url = routes[i];
  console.log(i, `\t`, url);
  const route = getRoute(url);
  const segment = await routeToFileSystem(cwd, route, allRoutes);
  await buildRoute(route, segment!, outdir, cwd, config, isDev);
}

// order here is important
if (config.writeURLsIndex) await writeURLsIndex(cwd, routes);
if (config.writeFilesIndex) await writeFilesIndex(cwd, config);

console.log("DONE");
