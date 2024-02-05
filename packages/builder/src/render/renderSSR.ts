import fs from "fs";
import pretty from "pretty";

export const renderSSR = async (
  ssrFile: string,
  outdir: string,
  prettify = false
) => {
  const App = (await import(ssrFile)).default;
  const output = App.render();
  const title = `Custom Title Code`;

  const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>

    <!-- <link rel="preload" href="./main.css" as="style" /> -->
    <link rel="preload" href="./main.js" as="script" />
  
    <link rel="stylesheet" href="./main.css">
    <!-- <style>${output.css.code}</style> -->
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
};
