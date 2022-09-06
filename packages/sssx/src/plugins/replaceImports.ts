import fs from '../lib/fs.js';
import glob from 'tiny-glob';
import { SEPARATOR } from '../utils/resolve.js';
import { config } from '../config/index.js';
import type { FilesMap } from '../types/index.js';
import { ensureDirExists } from '../utils/ensureDirExists.js';

const importRe =
  /import\s+?(?:(?:(?:[\w*\s{},]*)\s+from\s+?)|)(?:(?:".*?")|(?:'.*?'))[\s]*?(?:;|$|)/gi;

type Options = {
  css: boolean;
  svelte: boolean;
  matchHashesImports: boolean;
  overwriteOriginal: boolean;
  dst: string;
  filesMap: FilesMap;
};

const defaultOptions: Options = {
  css: true,
  svelte: true,
  matchHashesImports: false,
  overwriteOriginal: false,
  dst: '',
  filesMap: {}
};

const getImportsURL = (entry: string) =>
  (entry.split(` `).pop() || '').replaceAll(`"`, ``).replace(`;`, ``);

/**
 * Replace only javascript imports in the generated code `component.js` -> `prefix-component-hash.js`
 * @param entry import line from the code
 * @param file source code file path
 * @param {Options} options replacement options
 * @param {string} code source code content
 * @returns {string} modifed source code content
 */
const replaceImportsToHashedImports = (
  entry: string,
  file: string,
  options: Options,
  code: string
) => {
  const relativePath = getImportsURL(entry);
  const filename = relativePath.split(`/`).pop() || '';
  const ext = filename.split(`.`).pop() || '';

  if (
    relativePath !== `sssx` &&
    !relativePath.startsWith(`./.`) &&
    !relativePath.startsWith(`./`) &&
    !relativePath.startsWith(`../.`) &&
    !relativePath.startsWith(`../`)
  )
    return code;

  let upDirs = 0;
  let path = relativePath;

  // TODO: refactor this to make it simpler
  while (path.startsWith(`../`)) {
    upDirs++;
    path = path.replace(`../`, ``);
  }

  const route = file
    .split(`/`)
    .slice(2, -1 - upDirs)
    .join(`/`);

  if (!filename.startsWith(config.filenamesPrefix) && !filename.endsWith(`.css`)) {
    const originalSourcePath = [config.sourceRoot, route, path]
      .filter((a) => a.length > 0)
      .join(`/`)
      .replaceAll(`/./`, `/`); // convert /src/routes/./blog/ into /src/routes/blog/
    // console.log(`replaceImportsToHashedImports`, originalSourcePath);
    try {
      const newFilename = getFilenameFromOptions(originalSourcePath, options.filesMap);
      const newRelativePath = relativePath.replace(filename, newFilename);
      // console.log(`replaceImports`, {relativePath, newRelativePath})
      code = code.replaceAll(`"${relativePath}"`, `"${newRelativePath}"`);
    } catch (err) {
      console.error(`replaceImportsToHashedImports err`, { originalSourcePath, file }, err);
    }
  }

  return code;
};

/**
 * A helper function to get hashed name of a compiled typescript file
 * @param originalSourcePath existing path from the import statement, like `../components/header.js`
 * @param filesMap map of source files and compiled and hashed files
 * @returns name of a matching file like `../components/sssx-header-ABCDEF.js`
 */
const getFilenameFromOptions = (originalSourcePath: string, filesMap: FilesMap) => {
  const originalFilename = originalSourcePath.split(SEPARATOR).slice(-1)[0];
  const array = filesMap[originalSourcePath]
    .map((a) => a.split(SEPARATOR).slice(-1)[0])
    .filter((a) => a !== originalFilename);

  return array[0];
};

const replaceFile = async (file: string, options: Options) => {
  let code = await fs.readFile(file, { encoding: 'utf-8' });
  const matches = code.match(importRe);

  const coreSvelteName = options.filesMap[`svelte.js`][0].split(`/`).pop() || '';

  matches &&
    matches.map((entry) => {
      if (options.css && entry.includes(`.css`)) {
        code = code.replace(entry, `// ${entry}`);
      }

      if (options.svelte) {
        if (entry.includes(`svelte/internal`))
          code = code.replace(entry, entry.replace(`"svelte/internal"`, `"../${coreSvelteName}"`));
        else if (entry.includes(`svelte`))
          code = code.replace(entry, entry.replace(`"svelte"`, `"../${coreSvelteName}"`));
      }

      if (options.matchHashesImports) {
        code = replaceImportsToHashedImports(entry, file, options, code);
      }
    });

  if (options.dst.length > 0) {
    const suffix = file.split(`/${config.compiledRoot}/`)[1];
    const fileTarget = `${options.dst}/${suffix}`;
    const fileTargetPath = fileTarget.split(`/`).slice(0, -1).join(`/`);
    ensureDirExists(fileTargetPath);
    await fs.writeFile(fileTarget, code, { flag: 'w' });
  }

  if (options.overwriteOriginal) await fs.writeFile(file, code, { flag: 'w' });
};

export const replaceImports = async (
  globWildcard: string,
  inputOptions: Partial<Options> = defaultOptions
) => {
  // console.log(`replaceImports`, globWildcard)
  const options: Options = Object.assign({}, defaultOptions, inputOptions);
  const files = await glob(globWildcard);
  await Promise.all(files.map((file) => replaceFile(file, options)));
};
