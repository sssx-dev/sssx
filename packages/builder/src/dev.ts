import open from "open";
import express from "express";
import { buildRoute } from "./render";
import { getConfig } from "./utils/config";
import { getAllRoutes, routeToFileSystem } from "./routes";
import { getRoute } from "./utils/getRoute";

const app = express();
const cwd = process.cwd();
const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = true;

const sleep = (ms: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const allRoutes = await getAllRoutes(cwd, config);

app.get("*", async (req, res) => {
  const { url } = req;
  const route = getRoute(url);

  // generate build only on main route request
  if (url.endsWith("/")) {
    const segment = await routeToFileSystem(cwd, route, allRoutes);
    if (segment) {
      await buildRoute(route, segment, outdir, cwd, config, isDev);
      // TODO: remove this wait, because files have not been copied yet fully
      await sleep();
    }
  } else if (url.indexOf(".") === -1) {
    // redirect /about to /about/
    return res.redirect(`${url}/`);
  }

  // serve the requested file from the filesystem
  let filename = url !== "/" ? url : "index.html";
  res.sendFile(`${outdir}/${filename}`);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const host = "127.0.0.1";

app.listen(port, host, () => {
  console.log(`Listening on port ${port}`);
  open(`http://${host}:${port}`);
});
