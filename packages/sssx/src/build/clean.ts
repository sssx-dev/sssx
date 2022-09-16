import fs from 'fs';
import { PREFIX, COMPILED, OUTDIR, OUTDIR_SSSX, config } from '../config/index.js';

const cleanDist = (target = `./${config.outDir}/`, createNewFolder = true) => {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true });
  if (createNewFolder) fs.mkdirSync(target);
};

type Options = {
  createNewFolder: boolean;
};

const defaultOptions: Options = {
  createNewFolder: true
};

export const clean = (cleanOptions: Options = defaultOptions) => {
  const options = Object.assign({}, defaultOptions, cleanOptions);

  cleanDist(PREFIX, options.createNewFolder);
  cleanDist(COMPILED, options.createNewFolder);
  cleanDist(OUTDIR, options.createNewFolder);
  cleanDist(OUTDIR_SSSX, options.createNewFolder);
};
