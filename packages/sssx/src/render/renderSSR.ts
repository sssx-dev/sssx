import fs from "node:fs";
import pretty from "pretty";
import { type Config } from "../config.ts";
import { type RouteInfo } from "../routes/index.ts";
import { cleanURL } from "../utils/cleanURL.ts";

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
  includeCSS = true
) => {
  const dataUri =
    "data:text/javascript;charset=utf-8," + encodeURIComponent(js);

  console.log("======================");
  const App = (await import(dataUri)).default;
  // const output = App.render({ data: props });
  const output = { head: "", css: { code: "" }, html: "" };
  console.log("======================");

  let head = "";
  head += output.head + `\n`;
  if (includeCSS && output.css.code) {
    head += `<style>${output.css.code}</style>\n`;
  }

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
    <div id="app">${output.html}</div>
    ${noJS ? "" : '<script type="module" src="./main.js"></script>'}
  </body>
</html>
`;

  fs.writeFileSync(`${outdir}/main.css`, output.css.code, "utf8");

  fs.writeFileSync(
    `${outdir}/${HTML_FILE}`,
    prettify ? pretty(html) : html,
    "utf8"
  );
};
