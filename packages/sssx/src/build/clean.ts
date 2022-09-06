import fs from 'fs';

import { PREFIX, COMPILED, OUTDIR, OUTDIR_SSSX } from '../config/index.js';

const cleanDist = (target = `./dist/`, createNewFolder = true) => {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true });
  if (createNewFolder) fs.mkdirSync(target);
};

export const clean = (createNewFolder = true) => {
  cleanDist(PREFIX, createNewFolder);
  cleanDist(COMPILED, createNewFolder);
  cleanDist(OUTDIR, createNewFolder);
  cleanDist(OUTDIR_SSSX, createNewFolder);
};
