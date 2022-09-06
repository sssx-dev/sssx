import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEPARATOR = `\n`;
// TODO: check if source code mapping remains intact
// TODO: this can be done nicer via replacing "import { create_ssr_component, escape, validate_component } from "svelte/internal";"
const POSTPROCESSING = fs
  .readFileSync(`${__dirname}/../patches/postProcessing.js`, { encoding: 'utf-8' })
  .split(SEPARATOR);

type Options = {
  first: boolean;
  last: boolean;
};
const getImportIndex = (lines: string[], options: Partial<Options>) => {
  let counter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith(`import`)) {
      counter = i;
      if (options.first) break;
    } else if (counter > 0) {
      // allow banner with comments first
      break;
    }
  }

  return counter;
};

const injectHydratableComponents = (text: string, selector: string) => {
  let index = 0;
  const replacement = selector.replace(`(`, `_sssx(`); // validate_component_sssx(

  while (text.indexOf(selector) !== -1) {
    text = text.replace(selector, `${replacement}${index}, `);
    index++;
  }

  return text;
};

// we inject generated SSR component, to ajust SSR code, so when it's called to generate static code, we inject hydratable calls automatically
// postProcessing -> ssr/route/x/name/index.svelte -> out/name/index.html
export const wrapHydratableComponents = (text: string, path?: string) => {
  text = injectHydratableComponents(text, `create_ssr_component(`);
  text = injectHydratableComponents(text, `validate_component(`);
  const lines = text.split(`\n`);
  const firstImport = getImportIndex(lines, { first: true });
  const lastImport = getImportIndex(lines, { last: true });

  const banner = firstImport > 0 ? lines.slice(0, firstImport) : [];
  const allImports = lines.slice(firstImport, lastImport + 1);
  const code = lines.slice(lastImport + 1);

  let imports = allImports.filter((line) => !line.includes(`.css`) && !line.startsWith(`import "`));
  const cssImports = allImports.filter(
    (line) => line.includes(`.css`) && line.startsWith(`import "`)
  );
  const cssFiles = cssImports.map((a) => {
    let relativeURL = a.replace(`import "`, ``).replace(`";`, ``).trim();

    if (relativeURL.startsWith(`../`) && relativeURL.includes(config.stylesPath)) {
      relativeURL = `/${config.stylesPath}` + relativeURL.split(config.stylesPath)[1];
    }

    return relativeURL;
  });

  // console.log(`wrapHydratableComponents`, path, {firstImport, lastImport, cssImports, imports})

  const cssLinks = cssFiles.map((url) => `<link rel="stylesheet" type="text/css" href="${url}">`);

  // when component needs to export css styles, lets grab them statically
  // and then use them in the route's page
  const variableName = `cssLinks`;
  const variablesArray: string[] = [];
  imports = imports.map((line) => {
    if (line.includes(config.componentsPath)) {
      const array = line.split(` `);
      const componentName = array[1];
      const exportName = `${variableName}${componentName}`;
      variablesArray.push(exportName);
      return line.replace(componentName, `${componentName}, {${variableName} as ${exportName}}`);
    }

    return line;
  });

  const result = [
    imports,
    banner,
    '///',
    '//=============== injected from wrapHydratableComponents start',
    POSTPROCESSING,
    '//=============== injecting css links',
    cssLinks.map((line) => `cssLinks.push(\`${line}\`)`),
    variablesArray.map((variable) => `cssLinks.push(...${variable})`),
    `cssLinks = cssLinks.filter(onlyUnique)`,
    '//=============== injected from wrapHydratableComponents end',
    code
  ];
  const data = result.flat(2).join(SEPARATOR);
  return data;
};
