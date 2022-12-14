import fs from '../../lib/fs.js';
import { build, type LogLevel } from 'esbuild';
import { BASE } from './base.js';
import { config, PREFIX } from '@sssx/config';
import { renamePlugin } from '../../plugins/renamePlugin.js';
import { ensureDirExists } from '../../utils/ensureDirExists.js';

export const buildTypeScript = async (
  entryPoints: string[],
  setFilesMap: (k: string, v: string) => void,
  logLevel: LogLevel = 'silent'
) => {
  const result = await build({
    entryPoints,
    entryNames: `[dir]/${config.filenamesPrefix}-[name]-[hash]`,
    ...BASE,
    bundle: false,
    write: false,
    outdir: `${PREFIX}/${config.compiledRoot}`,
    minify: false,
    plugins: [renamePlugin({ force: true })],
    logLevel
  });

  // passing back mapping for route/route.ts -> .ssr/compiled/route/route-hash.js
  result.outputFiles.map((output, index) => {
    const entry = entryPoints[index].replace(`.ts`, `.js`);
    setFilesMap(entry, output.path);
  });

  await Promise.all(
    result.outputFiles.map(async (output) => {
      const path = output.path.split(`/`).slice(0, -1).join(`/`);
      ensureDirExists(path);

      await fs.writeFile(output.path, output.text, { encoding: 'utf-8' });
    })
  );
};
