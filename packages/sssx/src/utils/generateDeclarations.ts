import path from 'path';
import { config } from '@sssx/config';
import fs from '../lib/fs.js';
import { capitalize } from './capitalize.js';

const FILENAME = `index.ts`;

export const generateDeclarations = () => {
  const base = path.resolve(process.cwd(), config.sourceRoot, config.routesPath);
  const names = fs
    .readdirSync(base, { withFileTypes: true })
    .filter((a) => !a.isFile())
    .map((a) => a.name);

  let script = `import { getPermalink } from 'sssx'\n\n`;

  names.map(
    (name) =>
      (script += `import type { Request as Request${capitalize(
        name
      )} } from './${name}/route.js'\n`)
  );

  script += `\n`;

  names.map(
    (name) =>
      (script += `import { permalink as permalink${capitalize(name)} } from './${name}/route.js'\n`)
  );

  script += `\n`;

  names.map(
    (name) =>
      (script +=
        `type ${name}T = Request${capitalize(name)} & {type: '${name}'}\n` +
        `type ${name} = Omit<${name}T, 'type'>\n\n`)
  );

  script += `/**\n`;
  script += `* Routes helper to generate link within a given route.\n`;
  script += `* @example SSSX.Routes['blog']({slug:'123'})\n`;
  script += `*/\n`;
  script += `export const Routes = {\n`;

  names.map(
    (name) =>
      (script += `\t'${name}': (request:${name}) => getPermalink('${name}', request, permalink${capitalize(
        name
      )}),\n`)
  );

  script += `}\n`;

  script = `// generated automatically using \`npx sssx generate\`\n` + `// do not edit\n` + script;

  // TODO: uncomment if you want to actually write a file
  // const { sourceRoot, routesPath } = config;

  // const filename = path.resolve(process.cwd(), sourceRoot, routesPath, FILENAME);
  // fs.writeFileSync(filename, script, 'utf8');
};
