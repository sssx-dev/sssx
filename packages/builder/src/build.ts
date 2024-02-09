import open from "open";
import express from "express";
import { buildRoute } from "./render";
import { getConfig } from "./utils/config";
import { getAllRoutes } from "./render/routes";

const app = express();
const cwd = process.cwd();
const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = false; // TODO: get this from the environment

const routes = (await getAllRoutes(`${cwd}/src/pages`)).map((s) => s.permalink);

await Promise.all(
  routes.map((url) => buildRoute(url, outdir, cwd, config, isDev))
);

console.log("DONE");
