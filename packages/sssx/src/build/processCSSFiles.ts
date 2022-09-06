import fs from 'fs/promises';
import path from 'path';
import postcss from 'postcss';
import postcssrc from 'postcss-load-config';
import type { ConfigContext } from 'postcss-load-config';

import { OUTDIR, COMPILED, SSR, config } from '../config/index.js';
import { ensureDirExists } from '../utils/ensureDirExists.js';
import { sha1 } from '../utils/sha1.js';

const fileOptions: any = { encoding: 'utf-8' };

const copySingleCSSFile = async (
  cssPath: string,
  setFilesMap: (k: string, v: string) => void,
  dstBase: string[] = [OUTDIR]
) => {
  // console.log(`copySingleCSSFile`, cssPath)

  const ctx: ConfigContext = {};
  const rawCSS = await fs.readFile(cssPath, fileOptions);
  const { plugins, options } = await postcssrc(ctx);
  const result = await postcss(plugins).process(rawCSS, { ...options, from: cssPath });
  const { css, map } = result;

  const { base, name, ext } = path.parse(cssPath);
  const hash = sha1(css).slice(0, 8).toUpperCase();
  const newFilename = [config.filenamesPrefix, name, hash].join(`-`) + ext;

  dstBase.map((dst) => {
    const dstCssPath = cssPath.replace(config.sourceRoot, dst).replace(base, newFilename);

    const dir = path.dirname(dstCssPath);
    ensureDirExists(dir);

    setFilesMap(cssPath, dstCssPath);

    fs.writeFile(dstCssPath, css, fileOptions);
    if (map) fs.writeFile(`${dstCssPath}.map`, map.toString());
  });
};

export const processCSSFiles = async (
  entryPointsCSS: string[],
  setFilesMap: (k: string, v: string) => void
) => {
  entryPointsCSS.map((cssPath) => copySingleCSSFile(cssPath, setFilesMap, [OUTDIR, COMPILED, SSR]));
};
