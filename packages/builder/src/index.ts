import fs from "fs";
import * as fsExtra from "fs-extra";
import esbuild, { type BuildOptions, type Plugin } from "esbuild";
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import copyPlugin from "esbuild-plugin-copy";
import pretty from "pretty";

const cwd = process.cwd();

const outdir = `${cwd}/dev`;
const finalOutdir = `${cwd}/dist`;
const enableSourcemap = false;
const logLevel = `info`;
const sourcemap = "inline";
const prettify = false;

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
} else {
  fsExtra.emptyDirSync(outdir);
}

if (fs.existsSync(finalOutdir)) {
  fsExtra.emptyDirSync(finalOutdir);
}

const copyPlugins = [
  copyPlugin({
    resolveFrom: "cwd",
    assets: {
      from: ["./public/*"],
      to: [outdir],
    },
  }),
  // not the best way to deal with the images
  copyPlugin({
    resolveFrom: "cwd",
    assets: {
      from: ["./src/**/*.svg"],
      to: [outdir],
    },
  }),
];

let common: BuildOptions = {
  entryPoints: [`./src/main.ts`],
  bundle: true,
  // outdir,
  mainFields: ["svelte", "browser", "module", "main"],
  conditions: ["svelte", "browser"],
  logLevel,
  minify: false, //so the resulting code is easier to understand
  splitting: true,
  write: true,
  format: `esm`,
};

const ssrFile = `${outdir}/ssr.js`;

// server
await esbuild
  .build({
    ...common,
    entryPoints: [`./src/App.svelte`],
    //
    outfile: ssrFile,
    splitting: false,
    //
    plugins: [
      sveltePlugin({
        preprocess: sveltePreprocess(),
        compilerOptions: {
          generate: "ssr",
          css: "injected",
          hydratable: true,
          // enableSourcemap,
        },
      }),
    ],
  })
  .catch((reason: any) => {
    console.warn(`Errors: `, reason);
    process.exit(1);
  });

////////////////////////////////////////////////////////////

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
if (prettify) {
  fs.writeFileSync(`${outdir}/index.html`, pretty(html), "utf8");
} else {
  fs.writeFileSync(`${outdir}/index.html`, html, "utf8");
}

////////////////////////////////////////////////////////////

// client
await esbuild
  .build({
    ...common,
    // sourcemap,
    outfile: `${outdir}/main.js`,
    splitting: false,
    minify: true,
    plugins: [
      ...copyPlugins,
      sveltePlugin({
        preprocess: sveltePreprocess(),
        compilerOptions: {
          // css: 'none',
          hydratable: true,
        },
      }),
    ],
  })
  .catch((reason) => {
    console.warn(`Errors: `, reason);
    process.exit(1);
  });

fs.cpSync(outdir, finalOutdir, { recursive: true });

// add dev mode and SSR mode (same but sourcemap + debugging HMR injection)
// add static build (URL by URL)
