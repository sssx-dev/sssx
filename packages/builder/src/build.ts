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

// generate sitemap.xml
await buildSitemap(outdir, config, all);

// TODO: add here core processing
for (let i = 0; i < routes.length; i++) {
  const url = routes[i];
  console.log({ i, url });
  await buildRoute(url, outdir, cwd, config, isDev);
}
