import Logger from '@sssx/logger';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from '../lib/fs.js';
import { config } from '../config/index.js';
import { IMPORT_REGEX } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEPARATOR = `\n`;
// TODO: check if source code mapping remains intact
// TODO: move to AST parsing
const POSTPROCESSING = fs
  .readFileSync(`${__dirname}/../patches/postProcessing.js`, { encoding: 'utf-8' })
  .split(SEPARATOR);

const injectHydratableComponents = (text: string, selector: string) => {
  let index = 0;
  const replacement = selector.replace(`(`, `_sssx(`); // validate_component_sssx(

  while (text.indexOf(selector) !== -1) {
    text = text.replace(selector, `${replacement}${index}, `);
    index++;
  }

  return text;
};

const processCSS = (imports: string[]) => {
  const cssImports = imports.filter((line) => line.includes(`.css`) && line.startsWith(`import "`));
  const cssFiles = cssImports.map((a) => {
    let relativeURL = a.replace(`import "`, ``).replace(`";`, ``).trim();

    if (relativeURL.startsWith(`../`) && relativeURL.includes(config.stylesPath)) {
      relativeURL = `/${config.stylesPath}` + relativeURL.split(config.stylesPath)[1];
    }

    return relativeURL;
  });
  const cssLinks = cssFiles.map((url) => `<link rel="stylesheet" type="text/css" href="${url}">`);

  return cssLinks;
};

const addCSSLinksImport = (matches: string[]) => {
  const imports = matches.join(`\n`).split(`\n`);
  // when component needs to export css styles, lets grab them statically
  // and then use them in the route's page
  const variableName = `cssLinks`;
  const variablesArray: string[] = [];
  const modifiedImports = imports.map((line) => {
    if (line.includes(config.componentsPath)) {
      const array = line.split(` `);
      const componentName = array[1];
      const exportName = `${variableName}${componentName}`;
      variablesArray.push(exportName);
      return line.replace(componentName, `${componentName}, {${variableName} as ${exportName}}`);
    }

    return line;
  });

  return { variablesArray, modifiedImports };
};

/**
 * @param code source code
 * @returns Comments in the top section of the source code
 */
const getBanner = (code: string) => {
  const banner = [];
  const lines = code.split(`\n`);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith('import')) banner.push(line);
    else break;
  }

  return banner.join('\n');
};

/**
 * we inject generated SSR component,
 * to ajust SSR code, so when it's called to generate static code,
 * we inject hydratable calls automatically.
 * postProcessing -> ssr/route/x/name/index.svelte -> out/name/index.html
 */
export const wrapHydratableComponents = (text: string) => {
  const matches = text.match(IMPORT_REGEX) || [];
  const banner = getBanner(text);

  text = text.replace(banner, '');
  matches.map((match) => (text = text.replace(match, '')));
  text = injectHydratableComponents(text, `create_ssr_component(`);
  text = injectHydratableComponents(text, `validate_component(`);

  const code = text;

  // let imports = allImports.filter((line) => !line.includes(`.css`) && !line.startsWith(`import "`));
  const imports = matches.filter((singleImport) => !singleImport.includes(`.css`));
  const cssLinks = processCSS(matches);
  const { variablesArray, modifiedImports } = addCSSLinksImport(imports);

  Logger.verbose(`wrapHydratableComponents`, path, {
    matches,
    cssLinks,
    modifiedImports
  });

  const result = [
    banner,
    modifiedImports,
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
