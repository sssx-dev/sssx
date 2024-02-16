import fs from "node:fs";
import os from "node:os";
import colors from "ansi-colors";
import cliProgress from "cli-progress";
import { Worker, threadId } from "node:worker_threads";
import { getConfig } from "../config.ts";
import { getAllRoutes } from "../routes/index.ts";
import { buildSitemap } from "../plugins/sitemap.ts";

import { writeURLsIndex } from "../indexes/writeURLsIndex.ts";
import { writeFilesIndex } from "../indexes/writeFilesIndex.ts";
import { cwd } from "../utils/cwd.ts";

const numCPUs = os.cpus().length;
const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = false;

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

let numWorkers = 0;
// TODO: not the best way to parallelize, rework
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

// console.log("============");

const getRoutesBatch = (i: number) => {
  return routes.slice(
    i * ROUTES_BATCH,
    Math.min(routes.length, (i + 1) * ROUTES_BATCH)
  );
};

type Message = {
  threadId: number;
  [key: string]: any;
};

// Create workers
for (var i = 0; i < numCPUs; i++) {
  // const routesBatch = getRoutesBatch(i);
  // console.log({ i, routesBatch });
  const workerPath = import.meta.resolve("./worker.js").replace("file://", "");

  const worker = new Worker(workerPath, {
    //@ts-ignore
    type: "module",
    deno: {
      permissions: "inherit",
    },
  });
  numWorkers++;

  worker.on("message", async (data: Message) => {
    // console.log(data);
    if (data.ready) {
      worker.postMessage({ routes: getRoutesBatch(data.threadId) });
    } else if (data.url) {
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

// console.log("============");

// runs in parallel to the workers
await buildSitemap(outdir, config, allRoutes);
