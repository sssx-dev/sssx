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
if (typeof process !== "undefined" && process.env.PORT) {
  port = parseInt(process.env.PORT);
}
const host = "127.0.0.1";
const devSite = `http://${host}:${port}`;

const app = express();
const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = true;
const allRoutes = await getAllRoutes(cwd, config);

const liveReloadServer = livereload.createServer();

let reloadTimeout: ReturnType<typeof setTimeout> | null = null;
watch(`${cwd}/src`, { recursive: true }, (_event, _name) => {
  // Throttle reload events
  if (reloadTimeout) clearTimeout(reloadTimeout);
  reloadTimeout = setTimeout(() => {
    liveReloadServer.refresh("/");
    reloadTimeout = null;
  }, 100);
});

app.use(connectLiveReload());

/**
 * Validates that the resolved path is within the allowed outdir.
 * Prevents path traversal attacks.
 */
const isPathSafe = (filePath: string, allowedDir: string): boolean => {
  const resolved = path.resolve(filePath);
  const resolvedDir = path.resolve(allowedDir);
  return resolved.startsWith(resolvedDir + path.sep) || resolved === resolvedDir;
};

const handler: RequestHandler = async (req, res) => {
  const { url } = req;
  const route = getRoute(url);

  try {
    // generate build only on main route request
    if (url.endsWith("/")) {
      const segment = await routeToFileSystem(cwd, route, allRoutes);
      if (segment) {
        await buildRoute(route, segment, outdir, cwd, config, isDev, devSite);
      } else {
        res.status(404).send(`<h1>404 — Route not found</h1><p>No route matched: <code>${url}</code></p>`);
        return;
      }
    } else if (url.indexOf(".") === -1) {
      // redirect /about to /about/
      res.redirect(`${url}/`);
      return;
    }

    // serve the requested file from the filesystem
    const filename = url.endsWith("/") ? `${url}/index.html` : url;
    const fullpath = path.normalize(`${outdir}/${filename}`);

    // Prevent path traversal
    if (!isPathSafe(fullpath, outdir)) {
      res.status(403).send("Forbidden");
      return;
    }

    if (!fs.existsSync(fullpath)) {
      res.status(404).send(`<h1>404 — File not found</h1><p><code>${filename}</code></p>`);
      return;
    }

    const ext = path.extname(fullpath).slice(1);
    const content = fs.readFileSync(fullpath);
    const contentType = mime.lookup(ext) || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.end(content);
  } catch (err) {
    console.error(`Error handling request for ${url}:`, err);
    res.status(500).send(`<h1>500 — Internal Server Error</h1><pre>${err instanceof Error ? err.message : String(err)}</pre>`);
  }
};

const DEBUG_PAGE = `__debug`;
app.get(`/${DEBUG_PAGE}`, async (_req, res) => {
  try {
    const allRoutes = await getAllRoutes(cwd, config);
    res.type("json");
    res.end(JSON.stringify(allRoutes, null, 2));
  } catch (err) {
    console.error("Error loading debug routes:", err);
    res.status(500).send("Error loading routes");
  }
});

app.use(async (req, res, next) => {
  const { url } = req;
  if (url !== `/${DEBUG_PAGE}` && url !== `/${DEBUG_PAGE}/`) {
    handler(req, res, next);
  } else {
    next();
  }
});

const server = app.listen(port, host, () => {
  console.log(`SSSX is listening on ${devSite}`);
  if (args.pop() === "open") {
    open(devSite);
  }
});

// Graceful shutdown
const shutdown = () => {
  console.log("\nShutting down SSSX dev server...");
  liveReloadServer.close();
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
