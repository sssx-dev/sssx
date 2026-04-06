import fs from "node:fs";
import { type Config } from "../config.ts";
import { getVersion } from "../utils/version.ts";

/**
 * Generate a default 404.html page.
 * Many static hosts (Netlify, Vercel, Cloudflare Pages, GitHub Pages)
 * serve 404.html automatically for missing routes.
 */
export const build404 = (outdir: string, config: Config) => {
  const title = config.title || "Page Not Found";
  const version = getVersion();

  const html = `<!doctype html>
<html lang="${(config.defaultLocale || "en-US").split("-")[0]}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content="SSSX v${version}" />
    <title>404 — ${title}</title>
    <style>
      body {
        font-family: system-ui, -apple-system, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
        background: #f9fafb;
        color: #374151;
      }
      .container {
        text-align: center;
        padding: 2rem;
      }
      h1 {
        font-size: 6rem;
        margin: 0;
        color: #d1d5db;
      }
      p {
        font-size: 1.25rem;
        margin: 1rem 0;
      }
      a {
        color: #3b82f6;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>404</h1>
      <p>Page not found</p>
      <a href="/">← Back to home</a>
    </div>
  </body>
</html>
`;

  fs.writeFileSync(`${outdir}/404.html`, html, "utf8");
};
