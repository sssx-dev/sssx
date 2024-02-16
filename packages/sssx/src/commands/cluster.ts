import fs from "node:fs";
import os from "node:os";
import {
  Worker,
  isMainThread,
  parentPort,
  workerData,
  threadId,
} from "node:worker_threads";
import { buildRoute } from "../render/index.ts";
import { getConfig } from "../config.ts";
import { getAllRoutes, routeToFileSystem } from "../routes/index.ts";
import { buildSitemap } from "../plugins/sitemap.ts";
import cliProgress from "cli-progress";
import colors from "ansi-colors";
import { getRoute } from "../utils/getRoute.ts";
import { writeURLsIndex } from "../indexes/writeURLsIndex.ts";
import { writeFilesIndex } from "../indexes/writeFilesIndex.ts";
import { cwd } from "../utils/cwd.ts";
import { isDeno } from "../utils/isDeno.ts";

const numCPUs = os.cpus().length;
const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = false;

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

let numWorkers = 0;
const allRoutes = await getAllRoutes(cwd, config);

const createBar = () =>
  new cliProgress.SingleBar({
    format:
      "SSSX |" +
      colors.cyan("{bar}") +
      "| {percentage}% | {duration_formatted} | {eta_formatted} left | URL: {url} | Total: {total}",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });

if (isMainThread) {
  const routes = allRoutes.map((s) => s.permalink);

  const ROUTES_BATCH = Math.round(routes.length / numCPUs);
  const bar1 = createBar();
  bar1.start(routes.length, 0, { url: "", total: 0 });
  let jobsIndex = 0;

  const onDone = async () => {
    bar1.update(routes.length);
    bar1.stop();

    if (config.writeURLsIndex) await writeURLsIndex(cwd, routes);
    if (config.writeFilesIndex) await writeFilesIndex(cwd, config);

    console.log("DONE");
  };

  // Create workers
  for (var i = 0; i < numCPUs; i++) {
    const routesBatch = routes.slice(
      i * ROUTES_BATCH,
      Math.min(routes.length, (i + 1) * ROUTES_BATCH)
    );
    const workerPath = import.meta.url.replace("file://", "");
    const worker = new Worker(workerPath, {
      workerData: routesBatch,
      //@ts-ignore
      type: "module",
      deno: {
        permissions: "inherit",
      },
    });
    numWorkers++;

    worker.on("message", async (data) => {
      // console.log(data);
      if (data.url) {
        const url = data.url;
        jobsIndex++;
        bar1.update(jobsIndex, { url, total: jobsIndex });
      } else if (data.terminate) {
        numWorkers--;

        if (numWorkers === 0) {
          await onDone();
        }
      }
    });
  }

  // runs in parallel to the workers
  await buildSitemap(outdir, config, allRoutes);
} else {
  const routes: string[] = workerData;
  // TODO: not the best way to parallelize, rework
  // const allRoutes = await getAllRoutes(cwd);
  // console.log("Worker", process.pid, routes.length);

  for (let i = 0; i < routes.length; i++) {
    const url = routes[i];
    // console.log({ i, url });
    // console.log("Worker", process.pid, i, routes.length, url);
    const route = getRoute(url);
    const segment = await routeToFileSystem(cwd, route, allRoutes);
    await buildRoute(route, segment!, outdir, cwd, config, isDev);
    parentPort?.postMessage({ url });
  }

  parentPort?.postMessage({ terminate: true, threadId });

  //@ts-ignore
  isDeno ? self.close() : process.exit(1);
}
