import path from "node:path";
import livereload from "livereload";
import connectLiveReload from "connect-livereload";
import open from "open";
import express from "express";
import watch from "node-watch";
import { buildRoute } from "../render/index.ts";
import { getConfig } from "../config.ts";
import { getAllRoutes, routeToFileSystem } from "../routes";
import { getRoute } from "../utils/getRoute.ts";
import { cwd } from "../utils/cwd.ts";
import { args } from "../utils/args.ts";

const app = express();
const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = true;
const allRoutes = await getAllRoutes(cwd, config);

const liveReloadServer = livereload.createServer();

// TODO: throttle change events
// TODO: build a more specialized updater and url
watch(`${cwd}/src`, { recursive: true }, (event, name) => {
  // console.log({ event, name });
  const route = "/";
  setTimeout(() => liveReloadServer.refresh(route), 1);
});

app.use(connectLiveReload());

app.get("*", async (req, res) => {
  const { url } = req;
  const route = getRoute(url);

  // generate build only on main route request
  if (url.endsWith("/")) {
    const segment = await routeToFileSystem(cwd, route, allRoutes);
    if (segment) {
      await buildRoute(route, segment, outdir, cwd, config, isDev);
    }
  } else if (url.indexOf(".") === -1) {
    // redirect /about to /about/
    return res.redirect(`${url}/`);
  }

  // serve the requested file from the filesystem
  const filename = url !== "/" ? url : "index.html";
  const fullpath = path.normalize(`${outdir}/${filename}`);

  res.sendFile(fullpath);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const host = "127.0.0.1";

app.listen(port, host, () => {
  const url = `http://${host}:${port}`;
  console.log(`SSSX is listening on ${url}`);
  if (args.pop() === "open") {
    open(url);
  }
});