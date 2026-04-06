import path from "node:path";
import fs from "node:fs";
import express from "express";
import mime from "mime-types";
import colors from "ansi-colors";
import { getConfig } from "../config.ts";
import { cwd } from "../utils/cwd.ts";
import { flags } from "../utils/args.ts";
import { getVersion } from "../utils/version.ts";

const { bold, dim, green } = colors;

let port = 8080;
if (flags.has("port")) {
  port = parseInt(flags.get("port") as string);
}
const host = "127.0.0.1";

const config = await getConfig(cwd);
const outdir = path.resolve(`${cwd}/${config.outDir}`);

if (!fs.existsSync(outdir)) {
  console.error(colors.red(`\n  Output directory "${config.outDir}" not found. Run "sssx build" first.\n`));
  process.exit(1);
}

const app = express();

// Serve static files with proper MIME types and caching
app.use((req, res, next) => {
  let filePath = path.join(outdir, req.path);

  // Directory → index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (!fs.existsSync(filePath)) {
    // Try 404.html
    const notFoundPath = path.join(outdir, "404.html");
    if (fs.existsSync(notFoundPath)) {
      res.status(404);
      filePath = notFoundPath;
    } else {
      res.status(404).send("Not Found");
      return;
    }
  }

  const ext = path.extname(filePath).slice(1);
  const contentType = mime.lookup(ext) || "application/octet-stream";

  // Cache immutable hashed assets aggressively
  if (req.path.startsWith("/_assets/")) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else if (["html"].includes(ext)) {
    res.setHeader("Cache-Control", "no-cache");
  } else {
    res.setHeader("Cache-Control", "public, max-age=3600");
  }

  res.setHeader("Content-Type", contentType);
  res.end(fs.readFileSync(filePath));
});

const server = app.listen(port, host, () => {
  console.log(bold(`\n  SSSX v${getVersion()}`) + dim(" static server"));
  console.log(dim(`  Serving ${config.outDir}/ on http://${host}:${port}\n`));
  console.log(dim(`  Press Ctrl+C to stop\n`));
});

const shutdown = () => {
  console.log(dim("\n  Shutting down..."));
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
