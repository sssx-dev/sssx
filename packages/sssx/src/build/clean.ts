import fs from 'fs';

import { PREFIX, COMPILED, OUTDIR, OUTDIR_SSSX } from '../config/index.js';

const cleanDist = (target = `./dist/`, createNewFolder = true) => {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true });
  if (createNewFolder) fs.mkdirSync(target);
};

type Options = {
  createNewFolder: boolean;
};

export const clean = (options: Options = { createNewFolder: true }) => {
  cleanDist(PREFIX, options.createNewFolder);
  cleanDist(COMPILED, options.createNewFolder);
  cleanDist(OUTDIR, options.createNewFolder);
  cleanDist(OUTDIR_SSSX, options.createNewFolder);
};
