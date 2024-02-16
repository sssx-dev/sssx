import { register } from "ts-node";
import { parentPort, workerData, threadId } from "node:worker_threads";
import { buildRoute } from "../render/index.ts";
import { isDeno } from "../utils/isDeno.ts";
import { getRoute } from "../utils/getRoute.ts";
import { getAllRoutes } from "../routes/index.ts";
import { routeToFileSystem } from "../routes/index.ts";
import { cwd } from "../utils/cwd.ts";
import { getConfig } from "../config.ts";

register();

const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = false;

const processData = async (routes) => {
  // TODO: not the best way to parallelize, rework
  const allRoutes = await getAllRoutes(cwd, config);

  for (let i = 0; i < routes.length; i++) {
    const url = routes[i];
    const route = getRoute(url);
    const segment = await routeToFileSystem(cwd, route, allRoutes);
    await buildRoute(route, segment, outdir, cwd, config, isDev);
    parentPort?.postMessage({ url, threadId });
  }

  parentPort?.postMessage({ terminate: true, threadId });

  //@ts-ignore
  isDeno ? self.close() : process.exit(1);
};

parentPort?.on("message", async (data) => {
  //   console.log("onMessage", data);
  if (data.routes) await processData(data.routes);
});

parentPort?.postMessage({ ready: true, threadId });
