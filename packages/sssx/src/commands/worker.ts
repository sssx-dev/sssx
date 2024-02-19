import { parentPort, threadId } from "node:worker_threads";
import { cwd } from "../utils/cwd.ts";
import { getConfig } from "../config.ts";
import { isDeno } from "../utils/isDeno.ts";
import { buildRoute } from "../render/index.ts";
import { getRoute } from "../utils/getRoute.ts";
import {
  getAllRoutes,
  routeToFileSystem,
  type RouteInfo,
} from "../routes/index.ts";

const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = false;

const processData = async (routes: RouteInfo[]) => {
  for (let i = 0; i < routes.length; i++) {
    const segment = routes[i];
    const url = segment.permalink;
    const route = getRoute(url);
    await buildRoute(route, segment!, outdir, cwd, config, isDev);
    parentPort?.postMessage({ url, threadId });
  }

  parentPort?.postMessage({ terminate: true, threadId });

  //@ts-ignore
  isDeno ? self.close() : process.exit(1);
};

type Message = {
  routes: RouteInfo[];
};

parentPort?.on("message", async (data: Message) => {
  //   console.log("onMessage", data);
  if (data.routes) await processData(data.routes);
});

parentPort?.postMessage({ ready: true, threadId });
