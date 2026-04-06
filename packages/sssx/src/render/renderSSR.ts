import fs from "node:fs";
import pretty from "pretty";
import { type Config } from "../config.ts";
import { type RouteInfo } from "../routes/index.ts";
import { cleanURL } from "../utils/cleanURL.ts";
import { render } from "svelte/server";

const HTML_FILE = `index.html`;

export const renderSSR = async (
  js: string,
  outdir: string,
  props: Record<string, any> = {},
  segment: RouteInfo,
  config: Config,
  devSite?: string,
  noJS = false,
  prettify = true,
  includeCSS = true,
  inputPath?: string
) => {
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

  if (segment.permalinks)
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

  const html = `
<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
    <link rel="stylesheet" href="./main.css">

    ${head}
    </head>
    <body>
    <div id="app">${output.body}</div>
    ${noJS ? "" : '<script type="module" src="./main.js"></script>'}
  </body>
</html>
`;

  fs.writeFileSync(
    `${outdir}/${HTML_FILE}`,
    prettify ? pretty(html) : html,
    "utf8"
  );
};
