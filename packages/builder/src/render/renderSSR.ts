import fs from "fs";
import pretty from "pretty";

const HTML_FILE = `index.html`;

export const renderSSR = async (
  js: string,
  outdir: string,
  props: Record<string, any> = {},
  title = `Custom Title Code`,
  lang = "en",
  prettify = false,
  includeCSS = true
) => {
  const dataUri =
    "data:text/javascript;charset=utf-8," + encodeURIComponent(js);

  const App = (await import(dataUri)).default;
  const output = App.render(props);

  let head = "";
  head += output.head + `\n`;
  if (includeCSS) {
    head += `<style>${output.css.code}</style>\n`;
  }

  if (!head.includes("<title>")) {
    head = `<title>${title}</title>\n${head}`;
  }

  // <link rel="preload" href="./main.css" as="style" />
  // <link rel="preload" href="./main.js" as="script" />

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
    <script type="module" src="./main.js"></script>
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
