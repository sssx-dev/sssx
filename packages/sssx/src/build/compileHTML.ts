import fs from '../lib/fs.js';
import path from 'path';
import { config, ROOT_DIR } from '../config/index.js';
import type { VirtualComponentData } from '../types/svelteExtension.js';
import { ensureDirExists } from '../utils/ensureDirExists.js';
import type { DataModule } from './loadDataModule.js';
import type { SSRModule } from './loadSSRModule.js';
import type { FilesMap } from '../types';
import type { RouteParams } from '../types/Route.js';

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
const getScript = (filesMap: FilesMap, { name, prefix, props }: VirtualComponentData) => {
  const COMPONENT_NAME = name;
  // const COMPONENT_PATH = `${ROOT_DIR}/${config.componentsPat}/${name.toLowerCase()}.js` // absolute

  const originalComponentsPath = [
    config.sourceRoot,
    config.componentsPath,
    `${name.toLowerCase()}.js`
  ].join(`/`);
  const absoluteComponentsPath =
    filesMap[originalComponentsPath].filter((a) => a.includes(`/${config.compiledRoot}/`)).pop() ||
    '';
  const componentsPath = [
    ROOT_DIR,
    config.componentsPath,
    absoluteComponentsPath.split(`/`).pop() || ''
  ].join(`/`);
  const componentParams = `{target, hydrate: true, props: ${JSON.stringify(props)}}`;

  return `import ${COMPONENT_NAME} from "${componentsPath}";
import { AbstractItem, FilesMap } from './types';
        (function(){
            const target = getTarget('${prefix}')
            const params = ${componentParams}
            new ${COMPONENT_NAME}(params);
        })()
    `;
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

type Args = {
  ssrModule: SSRModule;
  dataModule: DataModule;
  outdir: string;
  item: RouteParams;
  filesMap: FilesMap;
  dynamic?: string;
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

// TODO: minify HTML
// TODO: minify JS
export const compileHTML = async (args: Args) => {
  const { ssrModule, dataModule, outdir, item, filesMap, dynamic } = args;
  ensureDirExists(outdir);

  const props = await dataModule.getProps(item);
  const result = ssrModule.render(props as never);
  const components = ssrModule.getHydratableComponents();
  const svelteURL = getSvelteURL(filesMap);

  // console.log(`compileHTML`, outdir, props, components)

  const modules = components.map(({ name, prefix, props }) => {
    return `<script type="module">
        ${getScript(filesMap, { name, prefix, props })}
        </script>`;
  });

  // console.log(`compileHTML`, result.head)

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

  const file = composeHTMLFile(head, html);
  await fs.writeFile(`${outdir}/index.html`, file, { encoding: 'utf-8' });
};
