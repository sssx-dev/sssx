import open from "open";
import express from "express";
import { buildRoute } from "./render";

const app = express();
const cwd = process.cwd();
const outdir = `${cwd}/dev`;

// TODO: replace App.svelte based on the route pages/path, and later content
// TODO: add watch functionlaity and reload
// TODO: start looking into adding tailwind support
// TODO: always trailing slash policy

app.get("*", async (req, res) => {
  const base = `${cwd}/src/pages`;
  await buildRoute(outdir, base, "+page.svelte");

  const { url } = req;
  let filename = "index.html";
  if (url !== "/") {
    filename = url;
  }
  res.sendFile(`${outdir}/${filename}`);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const host = "127.0.0.1";

app.listen(port, host, () => {
  console.log(`Listening on port ${port}`);
  open(`http://${host}:${port}`);
});
