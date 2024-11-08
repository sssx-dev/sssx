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

  // const filename = "main_ssr_file_set_in_renderSSR";
  // const App = (await import(dataUri)).default;
  const App = (await import(inputPath ? inputPath : dataUri)).default;
  // TODO: uncomment before publishing
  // App({ head: { out: "" } }, { data: [], out: {} });
  const output = render(App, { props });
  // const output = { head: "", css: { code: "" }, html: "" };

  let head = "";
  head += output.head + `\n`;

  // TODO: find a way to uncomment CSS
  // if (includeCSS && output.css.code) {
  //   head += `<style>${output.css.code}</style>\n`;
  // }

  if (!head.includes("<title>")) {
    head = `<title>${config.title}</title>\n${head}`;
  }

  // <link rel="preload" href="./main.css" as="style" />
  // <link rel="preload" href="./main.js" as="script" />

  const lang = config.defaultLocale!.split("-")[0];

  // console.log(segment)

  const site = devSite ? devSite : config.site;

  // so far only works for the content routes
  // TODO: add this for other types too
  if (segment.permalinks)
    Object.keys(segment.permalinks).map((locale: string) => {
      const permalink = segment.permalinks![locale];
      const hreflang = locale.toLowerCase();
      const href = cleanURL(
        `${site}${permalink}`.replace(`${config.defaultLocale!}/`, "")
      );
      // console.log({locale, href, hreflang})
      head += `\n<link rel="alternate" hreflang="${hreflang}" href="${href}" />`;
      if (locale === config.defaultLocale) {
        head += `\n<link rel="alternate" hreflang="x-default" href="${href}" />`;
      }
    });

  // ${noJS ? "" : '<script type="module" src="./main.js"></script>'}
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
    ${noJS ? "" : "<script>onload = (event) => import('./main.js');</script>"}
  </body>
</html>
`;

  // TODO: find a way to uncomment CSS
  // fs.writeFileSync(`${outdir}/main.css`, output.css.code, "utf8");

  fs.writeFileSync(
    `${outdir}/${HTML_FILE}`,
    prettify ? pretty(html) : html,
    "utf8"
  );
};
