import fs from "node:fs";
import pretty from "pretty";
import { type Config } from "../config.ts";
import { type RouteInfo } from "../routes/index.ts";
import { cleanURL } from "../utils/cleanURL.ts";
import { render } from "svelte/server";
import { getVersion } from "../utils/version.ts";
import { generateSEOHead } from "../plugins/seo.ts";
import { generateJsonLD } from "../plugins/jsonld.ts";
import { type SSSXPlugin, runTransform, type RouteContext } from "../plugins/types.ts";

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
  /** SSSX plugins for transform hooks */
  plugins?: SSSXPlugin[];
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
  const plugins = opts.plugins || [];

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

  // Alternate hreflang links
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

  // Comprehensive SEO meta tags (canonical, OG, Twitter, etc.)
  head += `\n` + generateSEOHead(segment, config, site);

  // JSON-LD structured data
  head += `\n` + generateJsonLD(segment, config, site);

  // Run transformHead plugin hooks
  if (plugins.length > 0) {
    const ctx: RouteContext = { config, cwd: "", outdir, routes: [], route: segment.permalink, segment, props };
    head = await runTransform(plugins, "transformHead", head, ctx);
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

  let finalHTML = shouldPrettify ? pretty(html) : html;

  // Run transformHTML plugin hooks
  if (plugins.length > 0) {
    const ctx: RouteContext = { config, cwd: "", outdir, routes: [], route: segment.permalink, segment, props };
    finalHTML = await runTransform(plugins, "transformHTML", finalHTML, ctx);
  }

  fs.writeFileSync(`${outdir}/${HTML_FILE}`, finalHTML, "utf8");
};
