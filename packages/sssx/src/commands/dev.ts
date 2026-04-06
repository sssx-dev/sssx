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
import { args, flags } from "../utils/args.ts";
import { getVersion } from "../utils/version.ts";
import colors from "ansi-colors";

// Dev build cache: route → last build timestamp
const buildCache = new Map<string, number>();
const SOURCE_TTL = 2000; // rebuild if older than 2 seconds

let port = 8080;
if (flags.has("port")) {
  port = parseInt(flags.get("port") as string);
} else if (typeof process !== "undefined" && process.env.PORT) {
  port = parseInt(process.env.PORT);
}
const host = "127.0.0.1";
const devSite = `http://${host}:${port}`;

const app = express();
const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = true;
let allRoutes = await getAllRoutes(cwd, config);

const liveReloadServer = livereload.createServer();

let reloadTimeout: ReturnType<typeof setTimeout> | null = null;
watch(`${cwd}/src`, { recursive: true }, async (_event, name) => {
  // Throttle reload events
  if (reloadTimeout) clearTimeout(reloadTimeout);
  reloadTimeout = setTimeout(async () => {
    // Re-scan routes when files are added/removed
    try {
      allRoutes = await getAllRoutes(cwd, config);
    } catch (e) {
      // ignore — route scan may fail mid-save
    }
    // Invalidate build cache on file changes
    buildCache.clear();
    liveReloadServer.refresh("/");
    if (name) {
      console.log(colors.dim(`  ↻ ${path.relative(cwd, name as string) || "file changed"}`));
    }
    reloadTimeout = null;
  }, 150);
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
        const lastBuild = buildCache.get(route) || 0;
        const now = Date.now();
        // Only rebuild if stale (file watcher will clear cache on changes)
        if (now - lastBuild > SOURCE_TTL) {
          await buildRoute(route, segment, outdir, cwd, config, isDev, devSite);
          buildCache.set(route, now);
        }
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

    // Cache static assets in dev (images, fonts, etc.) but not HTML/JS
    if (ext && !["html", "js", "mjs"].includes(ext)) {
      res.setHeader("Cache-Control", "public, max-age=3600");
    } else {
      res.setHeader("Cache-Control", "no-cache");
    }

    res.end(content);
  } catch (err) {
    console.error(`Error handling request for ${url}:`, err);
    res.status(500).send(`<h1>500 — Internal Server Error</h1><pre>${err instanceof Error ? err.message : String(err)}</pre>`);
  }
};

const DEBUG_PAGE = `__debug`;
app.get(`/${DEBUG_PAGE}`, async (_req, res) => {
  try {
    const freshRoutes = await getAllRoutes(cwd, config);
    const plain = freshRoutes.filter((r) => r.type === "plain");
    const filesystem = freshRoutes.filter((r) => r.type === "filesystem");
    const content = freshRoutes.filter((r) => r.type === "content");

    const html = `
<!doctype html>
<html>
<head>
  <title>SSSX Debug</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; color: #333; }
    h1 { color: #10b981; }
    h2 { margin-top: 2rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
    .route { padding: 0.4rem 0; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; }
    .route:hover { background: #f9fafb; }
    a { color: #3b82f6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .badge { background: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #6b7280; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0; }
    .stat { background: #f3f4f6; padding: 1rem; border-radius: 8px; text-align: center; }
    .stat-num { font-size: 2rem; font-weight: bold; color: #10b981; }
  </style>
</head>
<body>
  <h1>🔍 SSSX Debug</h1>
  <div class="stats">
    <div class="stat"><div class="stat-num">${freshRoutes.length}</div>Total Routes</div>
    <div class="stat"><div class="stat-num">${plain.length}</div>Plain</div>
    <div class="stat"><div class="stat-num">${filesystem.length}</div>Filesystem</div>
  </div>
  <div class="stats">
    <div class="stat"><div class="stat-num">${content.length}</div>Content</div>
  </div>
  
  <h2>All Routes</h2>
  ${freshRoutes.map(r => `<div class="route"><a href="${r.permalink}">${r.permalink}</a> <span class="badge">${r.type}</span></div>`).join("\n  ")}
  
  <h2>Raw JSON</h2>
  <details><summary>Click to expand</summary><pre>${JSON.stringify(freshRoutes, null, 2)}</pre></details>
</body>
</html>`;
    res.type("html");
    res.end(html);
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
  console.log(colors.bold(`\n  SSSX v${getVersion()}`) + colors.dim(" dev server"));
  console.log(colors.dim(`  Listening on ${devSite}\n`));
  console.log(colors.dim(`  Routes: ${allRoutes.length} | Debug: ${devSite}/__debug\n`));
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
