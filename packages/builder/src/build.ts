import fs from "fs";
import { buildRoute } from "./render";
import { getConfig } from "./utils/config";
import { getAllRoutes, routeToFileSystem } from "./routes";
import { buildSitemap } from "./plugins/sitemap";
import { getRoute } from "./utils/getRoute";
import { writeURLsIndex } from "./utils/writeURLsIndex";

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

// TODO: add here core processing
for (let i = 0; i < routes.length; i++) {
  const url = routes[i];
  console.log(i, `\t`, url);
  const route = getRoute(url);
  const segment = await routeToFileSystem(cwd, route, allRoutes);
  await buildRoute(route, segment!, outdir, cwd, config, isDev);
}

if (config.writeURLsIndex) await writeURLsIndex(cwd, routes);

console.log("DONE");
