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
import { Timer } from "../utils/timer.ts";
import colors from "ansi-colors";
import { formatBuildError } from "../utils/errors.ts";
import { errorOverlay, dev404Page } from "../utils/devOverlay.ts";

const { bold, dim, green, cyan, yellow } = colors;

// ── Config ──────────────────────────────────────────────
const startupTimer = new Timer();

let port = 8080;
if (flags.has("port")) {
  port = parseInt(flags.get("port") as string);
} else if (typeof process !== "undefined" && process.env.PORT) {
  port = parseInt(process.env.PORT);
}
const host = "127.0.0.1";
const devSite = `http://${host}:${port}`;
const shouldOpen = flags.has("open") || args.includes("open");

const app = express();
const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = true;
let allRoutes = await getAllRoutes(cwd, config);

const routeLoadTime = startupTimer.format();

// ── Build cache ─────────────────────────────────────────
const buildCache = new Map<string, number>();
const SOURCE_TTL = 2000;

// ── Live reload ─────────────────────────────────────────
const liveReloadServer = livereload.createServer();

let reloadTimeout: ReturnType<typeof setTimeout> | null = null;
watch(`${cwd}/src`, { recursive: true }, async (_event, name) => {
  if (reloadTimeout) clearTimeout(reloadTimeout);
  reloadTimeout = setTimeout(async () => {
    try {
      allRoutes = await getAllRoutes(cwd, config);
    } catch {
      // route scan may fail mid-save
    }
    buildCache.clear();
    liveReloadServer.refresh("/");
    if (name) {
      const rel = path.relative(cwd, name as string) || "file changed";
      console.log(dim(`  ${yellow("↻")} ${rel}`));
    }
    reloadTimeout = null;
  }, 150);
});

app.use(connectLiveReload());

// ── Path safety ─────────────────────────────────────────
const isPathSafe = (filePath: string, allowedDir: string): boolean => {
  const resolved = path.resolve(filePath);
  const resolvedDir = path.resolve(allowedDir);
  return resolved.startsWith(resolvedDir + path.sep) || resolved === resolvedDir;
};

// ── Request handler ─────────────────────────────────────
const handler: RequestHandler = async (req, res) => {
  const { url } = req;
  const route = getRoute(url);
  const reqTimer = new Timer();

  try {
    if (url.endsWith("/")) {
      const segment = await routeToFileSystem(cwd, route, allRoutes);
      if (segment) {
        const lastBuild = buildCache.get(route) || 0;
        const now = Date.now();
        if (now - lastBuild > SOURCE_TTL) {
          await buildRoute(route, segment, outdir, cwd, config, isDev, devSite);
          buildCache.set(route, now);
          console.log(
            dim(`  ${green("●")} `) + cyan(url) + dim(` ${reqTimer.format()}`)
          );
        } else {
          console.log(
            dim(`  ${green("○")} `) + dim(url) + dim(` ${reqTimer.format()} (cached)`)
          );
        }
      } else {
        // Show dev 404 with route list and search
        console.log(dim(`  ${yellow("?")} `) + yellow(url) + dim(" 404"));
        res.status(404).send(dev404Page(url, allRoutes));
        return;
      }
    } else if (url.indexOf(".") === -1) {
      res.redirect(`${url}/`);
      return;
    }

    const filename = url.endsWith("/") ? `${url}/index.html` : url;
    const fullpath = path.normalize(`${outdir}/${filename}`);

    if (!isPathSafe(fullpath, outdir)) {
      res.status(403).send("Forbidden");
      return;
    }

    if (!fs.existsSync(fullpath)) {
      res.status(404).send(dev404Page(url, allRoutes));
      return;
    }

    const ext = path.extname(fullpath).slice(1);
    const content = fs.readFileSync(fullpath);
    const contentType = mime.lookup(ext) || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Cache-Control",
      ext && !["html", "js", "mjs"].includes(ext)
        ? "public, max-age=3600"
        : "no-cache"
    );
    res.end(content);
  } catch (err) {
    console.error(formatBuildError(err, url));
    // Show styled error overlay in the browser
    res.status(500).send(errorOverlay(err, url));
  }
};

// ── Debug page ──────────────────────────────────────────
const DEBUG_PAGE = `__debug`;
app.get(`/${DEBUG_PAGE}`, async (_req, res) => {
  try {
    const freshRoutes = await getAllRoutes(cwd, config);
    const plain = freshRoutes.filter((r) => r.type === "plain");
    const filesystem = freshRoutes.filter((r) => r.type === "filesystem");
    const content = freshRoutes.filter((r) => r.type === "content");

    const html = `<!doctype html>
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
    input { width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; margin: 1rem 0; font-size: 0.9rem; }
    input:focus { outline: none; border-color: #3b82f6; }
  </style>
</head>
<body>
  <h1>🔍 SSSX Debug</h1>
  <div class="stats">
    <div class="stat"><div class="stat-num">${freshRoutes.length}</div>Total</div>
    <div class="stat"><div class="stat-num">${plain.length}</div>Plain</div>
    <div class="stat"><div class="stat-num">${filesystem.length}</div>Dynamic</div>
  </div>
  <div class="stats">
    <div class="stat"><div class="stat-num">${content.length}</div>Content</div>
  </div>
  <h2>Routes</h2>
  <input type="text" placeholder="Filter routes..." oninput="filter(this.value)" autofocus />
  <div id="routes">
    ${freshRoutes.map((r) => `<div class="route"><a href="${r.permalink}">${r.permalink}</a> <span class="badge">${r.type}</span></div>`).join("\n    ")}
  </div>
  <h2>Raw JSON</h2>
  <details><summary>Click to expand</summary><pre>${JSON.stringify(freshRoutes, null, 2)}</pre></details>
  <script>
    function filter(q) {
      document.querySelectorAll('.route').forEach(el => {
        el.style.display = el.textContent.includes(q) ? '' : 'none';
      });
    }
  </script>
</body>
</html>`;
    res.type("html");
    res.end(html);
  } catch (err) {
    res.status(500).send(errorOverlay(err, "/__debug"));
  }
});

// ── Route middleware ─────────────────────────────────────
app.use(async (req, res, next) => {
  const { url } = req;
  if (url !== `/${DEBUG_PAGE}` && url !== `/${DEBUG_PAGE}/`) {
    handler(req, res, next);
  } else {
    next();
  }
});

// ── Start server ────────────────────────────────────────
const server = app.listen(port, host, () => {
  const startupTime = startupTimer.format();
  console.log("");
  console.log(bold(`  SSSX v${getVersion()}`) + dim(" dev server"));
  console.log("");
  console.log(`  ${dim("Local:")}    ${cyan(`http://${host}:${port}/`)}`);
  console.log(`  ${dim("Debug:")}    ${cyan(`http://${host}:${port}/__debug`)}`);
  console.log(`  ${dim("Routes:")}   ${green(String(allRoutes.length))} ${dim(`(loaded in ${routeLoadTime})`)}`);
  console.log(`  ${dim("Startup:")}  ${startupTime}`);
  console.log("");
  console.log(dim("  Watching src/ for changes...\n"));

  if (shouldOpen) {
    open(devSite);
  }
});

// ── Graceful shutdown ───────────────────────────────────
const shutdown = () => {
  console.log(dim("\n  Shutting down...\n"));
  liveReloadServer.close();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
