import open from "open";
import express from "express";
import { buildRoute } from "./render";
import { getConfig } from "./utils/config";

const app = express();
const cwd = process.cwd();
const config = await getConfig(cwd);
const outdir = `${cwd}/${config.outDir}`;
const isDev = true;

app.get("*", async (req, res) => {
  const { url } = req;

  // generate build only on main route request
  if (url.endsWith("/")) {
    await buildRoute(url, outdir, cwd, config, isDev);
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
