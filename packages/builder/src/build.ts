import { buildRoute } from "./render";
import { getConfig } from "./utils/config";
import { getAllRoutes } from "./render/routes";

const cwd = process.cwd();
const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = false;

const routes = (await getAllRoutes(cwd)).map((s) => s.permalink);

await Promise.all(
  routes.map((url) => buildRoute(url, outdir, cwd, config, isDev))
);

console.log("DONE");
