import path from "node:path";
import fs from "node:fs";
import livereload from "livereload";
import connectLiveReload from "connect-livereload";
import open from "open";
import express from "express";
import { type RequestHandler } from "express";
import watch from "node-watch";
import mime from "mime-types";
import { buildRoute } from "../render/index.ts";
import { getConfig } from "../config.ts";
import { getAllRoutes, routeToFileSystem } from "../routes/index.ts";
import { getRoute } from "../utils/getRoute.ts";
import { cwd } from "../utils/cwd.ts";
import { args } from "../utils/args.ts";

let port = 8080;
if (process) {
  if (process.env.PORT) port = parseInt(process.env.PORT);
}
const host = "127.0.0.1";
const devSite = `http://${host}:${port}`;

const app = express();
const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = true;
const allRoutes = await getAllRoutes(cwd, config);

const liveReloadServer = livereload.createServer();

// TODO: throttle change events
watch(`${cwd}/src`, { recursive: true }, (event, name) => {
  // console.log({ event, name });
  const route = "/";
  setTimeout(() => liveReloadServer.refresh(route), 1);
});

app.use(connectLiveReload());

const handler: RequestHandler = async (req, res) => {
  const { url } = req;
  const route = getRoute(url);

  // generate build only on main route request
  if (url.endsWith("/")) {
    const segment = await routeToFileSystem(cwd, route, allRoutes);
    if (segment) {
      await buildRoute(route, segment, outdir, cwd, config, isDev, devSite);
    }
  } else if (url.indexOf(".") === -1) {
    // redirect /about to /about/
    return res.redirect(`${url}/`);
  }

  // serve the requested file from the filesystem
  const filename = url.endsWith("/") ? `${url}/index.html` : url;
  const ext = filename.split(".").pop()!;
  const fullpath = path.normalize(`${outdir}/${filename}`);

  const content = fs.readFileSync(fullpath);
  const contentType = mime.lookup(ext) as string;

  res.setHeader("Content-Type", contentType);
  res.end(content);
};

const DEBUG_PAGE = `__debug`;
app.get(`/${DEBUG_PAGE}`, async (req, res) => {
  const allRoutes = await getAllRoutes(cwd, config);
  res.type("json");
  res.end(JSON.stringify(allRoutes, null, 2));
});

app.use(async (req, res, next) => {
  const { url } = req;
  if (url != DEBUG_PAGE && url !== `/${DEBUG_PAGE}/`) handler(req, res, next);
  else next();
});

app.listen(port, host, () => {
  console.log(`SSSX is listening on ${devSite}`);
  if (args.pop() === "open") {
    open(devSite);
  }
});
