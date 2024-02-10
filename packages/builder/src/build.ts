import fs from "fs";
import { buildRoute } from "./render";
import { getConfig } from "./utils/config";
import { getAllRoutes } from "./render/routes";
import { buildSitemap } from "./plugins/sitemap";

const cwd = process.cwd();
const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = false;

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const all = await getAllRoutes(cwd);
const routes = all.map((s) => s.permalink);

// await Promise.all(
//   routes.map((url) => buildRoute(url, outdir, cwd, config, isDev))
// );

// generate sitemap.xml
await buildSitemap(outdir, config, all);

console.log("DONE");
