import fs from "node:fs";
import pretty from "pretty";
import { type Config } from "../config.ts";
import { type RouteInfo } from "../routes/index.ts";
import { cleanURL } from "../utils/cleanURL.ts";
import { render } from "svelte/server";
import { getVersion } from "../utils/version.ts";

const HTML_FILE = `index.html`;

export interface RenderOptions {
  js: string;
  outdir: string;
  props?: Record<string, any>;
  segment: RouteInfo;
  config: Config;
  devSite?: string;
  noJS?: boolean;
  prettify?: boolean;
  includeCSS?: boolean;
  inputPath?: string;
  /** Override path to the JS bundle (e.g. from asset manifest) */
  jsPath?: string;
  /** Override path to the CSS bundle */
  cssPath?: string;
}

export const renderSSR = async (opts: RenderOptions) => {
  const {
    js,
    outdir,
    props = {},
    segment,
    config,
    devSite,
    noJS = false,
    prettify: shouldPrettify = true,
    inputPath,
    jsPath = "./main.js",
    cssPath = "./main.css",
  } = opts;

  const dataUri =
    "data:text/javascript;charset=utf-8," + encodeURIComponent(js);

  const App = (await import(inputPath ? inputPath : dataUri)).default;
  const output = render(App, { props });

  let head = "";
  head += output.head + `\n`;

  if (!head.includes("<title>")) {
    head = `<title>${config.title}</title>\n${head}`;
  }

  const lang = config.defaultLocale!.split("-")[0];
  const site = devSite ? devSite : config.site;

  if (segment.permalinks) {
    Object.keys(segment.permalinks).map((locale: string) => {
      const permalink = segment.permalinks![locale];
      const hreflang = locale.toLowerCase();
      const href = cleanURL(
        `${site}${permalink}`.replace(`${config.defaultLocale!}/`, "")
      );
      head += `\n<link rel="alternate" hreflang="${hreflang}" href="${href}" />`;
      if (locale === config.defaultLocale) {
        head += `\n<link rel="alternate" hreflang="x-default" href="${href}" />`;
      }
    });
  }

  // Canonical URL
  if (site && segment.permalink) {
    const canonical = cleanURL(`${site}${segment.permalink}`);
    head += `\n<link rel="canonical" href="${canonical}" />`;
  }

  // Open Graph basics from segment params
  if (segment.param) {
    const p = segment.param;
    if (p.title) head += `\n<meta property="og:title" content="${p.title}" />`;
    if (p.description) {
      head += `\n<meta property="og:description" content="${p.description}" />`;
      head += `\n<meta name="description" content="${p.description}" />`;
    }
    if (p.keywords) head += `\n<meta name="keywords" content="${p.keywords}" />`;
    if (p.image) head += `\n<meta property="og:image" content="${p.image}" />`;
    if (p.date) head += `\n<meta property="article:published_time" content="${p.date}" />`;
    if (p.updated) head += `\n<meta property="article:modified_time" content="${p.updated}" />`;
  }

  const version = getVersion();

  const html = `
<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content="SSSX v${version}" />

    <link rel="stylesheet" href="${cssPath}">

    ${head}
    </head>
    <body>
    <div id="app">${output.body}</div>
    ${noJS ? "" : `<script type="module" src="${jsPath}"></script>`}
  </body>
</html>
`;

  fs.writeFileSync(
    `${outdir}/${HTML_FILE}`,
    shouldPrettify ? pretty(html) : html,
    "utf8"
  );
};
