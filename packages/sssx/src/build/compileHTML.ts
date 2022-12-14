import path from 'path';
import pretty from 'pretty';
import Logger from '@sssx/logger';
import { config, ROOT_DIR } from '@sssx/config';

import fs from '../lib/fs.js';
import type { VirtualComponentData } from '../types/svelteExtension.js';
import { ensureDirExists } from '../utils/ensureDirExists.js';
import type { SSRModule } from './loadSSRModule.js';
import type { FilesMap } from '../types';
import type { DataModule, Route } from '../types/Route.js';
import { SEPARATOR } from '../constants.js';
import { getBanner } from '../utils/getBanner.js';

// import htmlPrettify from 'html-prettify';
import htmlMinifier from 'html-minifier';
import UglifyJS from 'uglify-js';

// get all nodes between two nodes start and end
const GET_TARGET_FN = `
const getTarget = (prefix) => {
    let array = []
    let el = document.getElementById(prefix+'-start')
    while(el.nextElementSibling.id !== prefix+'-end'){
        el = el.nextElementSibling
        array.push(el)
    }
    return array
}
`.trim();

const LOAD_DYNAMIC_JS = (url: string) =>
  `const newURL = "${url}?"+new Date().getTime(); import(newURL);`; // dynamic load

// TODO: preload components
// TODO: merge code
// TODO: offload data to files if bigger than x
// TODO: load static CSS
// TODO: generate CSS file from svelte pieces
const getScript = (
  filesMap: FilesMap,
  { name, prefix, props }: VirtualComponentData,
  minify = false
) => {
  const COMPONENT_NAME = name;
  // const COMPONENT_PATH = `${ROOT_DIR}/${config.componentsPat}/${name.toLowerCase()}.js` // absolute

  const originalComponentsPath = [
    config.sourceRoot,
    config.componentsPath,
    `${name.toLowerCase()}.js`
  ].join(SEPARATOR);

  const componentPaths = filesMap[originalComponentsPath].filter((a) =>
    a.includes(`${SEPARATOR}${config.compiledRoot}${SEPARATOR}`)
  );

  const absoluteComponentsPath = componentPaths[componentPaths.length - 1];

  const componentsPath = [
    ROOT_DIR,
    config.componentsPath,
    absoluteComponentsPath.split(SEPARATOR).pop() || ''
  ].join(SEPARATOR);

  const componentParams = `{target, hydrate: true, props: ${JSON.stringify(props)}}`;

  const script = `   import ${COMPONENT_NAME} from "${componentsPath}";
    (function(){
        const target = getTarget('${prefix}')
        const params = ${componentParams}
        new ${COMPONENT_NAME}(params);
    })()
`;

  const minified =
    minify && UglifyJS.minify(script, { toplevel: true, mangle: true, compress: { passes: 2 } });

  return minified ? (!minified.error ? minified.code : script) : script;
};

const composeHTMLFile = (head: string[], html: string[], lang = 'en') => {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${head.join(`\n`)}
</head>

<body>
    ${html.join(`\n`)}
</body>
</html>`;
};

const getSvelteURL = (filesMap: FilesMap) => {
  const filename = filesMap[`svelte.js`][0].split(`/`).pop() || '';
  return `${ROOT_DIR}/${filename}`;
};

const mapCSSFiles = (head: string[], filesMap: FilesMap) => {
  return head.map((line) => {
    if (line.includes(`rel="stylesheet"`) || line.includes(`type="text/css"`)) {
      const originalURL = line.split(`href="`)[1].split(`"`)[0]; // /styles/globals.css
      const mappedFile = filesMap[config.sourceRoot + originalURL][0];
      const originalFileName = path.basename(originalURL);
      const newFileName = path.basename(mappedFile);
      return line.replace(originalFileName, newFileName);
    }
    return line;
  });
};

type Args = {
  ssrModule: SSRModule;
  dataModule: DataModule;
  outdir: string;
  route: Route;
  filesMap: FilesMap;
  dynamic?: string;
  prettify?: boolean;
  minify?: boolean;
};

const defaultArgs: Partial<Args> = {
  prettify: true,
  minify: false
};

export const compileHTML = async (input: Args) => {
  const args = Object.assign({}, defaultArgs, input);
  const { ssrModule, dataModule, outdir, route, filesMap, dynamic, prettify, minify } = args;
  const { request } = route;
  ensureDirExists(outdir);

  const data = await dataModule.data(request);
  const result = ssrModule.render({ data, request });
  const components = ssrModule.getHydratableComponents();
  const svelteURL = getSvelteURL(filesMap);

  Logger.verbose(`compileHTML`, outdir, data, components);

  const modules = components.map(({ name, prefix, props }) => {
    return `<script type="module">
        ${getScript(filesMap, { name, prefix, props }, minify)}
        </script>`;
  });

  Logger.verbose(`compileHTML`, result.head);

  const dynamicHeadScript = dynamic
    ? `<script rel="module">${LOAD_DYNAMIC_JS(dynamic)}</script>`
    : ``;

  let head: string[] = mapCSSFiles(result.head.split(`\n`), filesMap);
  const html: string[] = [result.html];
  const css = result.css.code.replaceAll(`.js`, `.svelte`);

  if (modules.length === 0) {
    // zero JS for static only pages
    head = [dynamicHeadScript, ...head, `<style>${css}</style>`];
  } else {
    head = [
      dynamicHeadScript,
      `<link rel="modulepreload" href="${svelteURL}">`,
      ...head,
      `<style>${css}</style>`,
      `<script>` + GET_TARGET_FN + `</script>`,
      ...modules
    ];
  }

  const fullHTML = `<!-- ${getBanner()} -->\n` + composeHTMLFile(head, html);
  const file = prettify
    ? pretty(fullHTML)
    : minify
    ? htmlMinifier.minify(fullHTML, {
        minifyJS: true,
        minifyCSS: true,
        collapseWhitespace: true,
        preserveLineBreaks: true,
        collapseInlineTagWhitespace: true
      })
    : fullHTML;

  Logger.log(JSON.stringify({ prettify, minify }));

  await fs.writeFile(`${outdir}/index.html`, file, 'utf8');
};
