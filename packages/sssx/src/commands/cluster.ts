import fs from "node:fs";
import os from "node:os";
import { Worker } from "node:worker_threads";

import { cwd } from "../utils/cwd.ts";
import { getConfig } from "../config.ts";
import { execArgv } from "../utils/tsNode.ts";
import { getAllRoutes } from "../routes/index.ts";
import { buildSitemap } from "../plugins/sitemap.ts";
import { writeURLsIndex } from "../indexes/writeURLsIndex.ts";
import { writeFilesIndex } from "../indexes/writeFilesIndex.ts";
import { createProgressBar } from "../utils/createProgressBar.ts";

const numCPUs = os.cpus().length;
const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const workerPath = import.meta.resolve("./worker.ts").replace("file://", "");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

// tracking number of workers
let numWorkers = 0;
const allRoutes = await getAllRoutes(cwd, config);

const ROUTES_BATCH = Math.round(allRoutes.length / numCPUs);
const bar1 = createProgressBar();
bar1.start(allRoutes.length, 0, { url: "", total: 0 });
let jobsIndex = 0;

const onDone = async () => {
  bar1.update(allRoutes.length);
  bar1.stop();

  if (config.writeURLsIndex)
    await writeURLsIndex(
      cwd,
      allRoutes.map((r) => r.permalink)
    );
  if (config.writeFilesIndex) await writeFilesIndex(cwd, config);

  console.log("DONE");
};

// console.log("============");

const getRoutesBatch = (i: number) => {
  return allRoutes
    .slice(i * ROUTES_BATCH, Math.min(allRoutes.length, (i + 1) * ROUTES_BATCH))
    .map((segment) => ({
      ...segment,
      // removing the module, because it can not be passed to the worker via shared memory
      module: undefined,
    }));
};

type Message = {
  threadId: number;
  [key: string]: any;
};

// Create workers
for (var i = 0; i < numCPUs; i++) {
  const worker = new Worker(workerPath, {
    execArgv: execArgv(),
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

// runs in parallel to the workers
await buildSitemap(outdir, config, allRoutes);
