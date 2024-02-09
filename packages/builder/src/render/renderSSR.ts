import fs from "fs";
import pretty from "pretty";

export const renderSSR = async (
  ssrFile: string,
  outdir: string,
  props: Record<string, any> = {},
  title = `Custom Title Code`,
  lang = "en",
  prettify = false,
  includeCSS = true,
  cleanSSRfiles = true
) => {
  const App = (await import(ssrFile)).default;
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
    `${outdir}/index.html`,
    prettify ? pretty(html) : html,
    "utf8"
  );

  if (cleanSSRfiles) {
    if (fs.existsSync(ssrFile)) {
      fs.rmSync(ssrFile);
    }

    const cssFile = ssrFile.replace(".js", ".css");
    if (fs.existsSync(cssFile)) {
      fs.rmSync(cssFile);
    }
  }
};
