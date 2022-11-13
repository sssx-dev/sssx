import path from 'path';
import { OUTDIR, config } from '@sssx/config';
import fs from '../lib/fs.js';

export const copyFiles = async (from: string = config.publicDir, to = '') => {
  const publicDir = path.resolve(process.cwd(), from);
  const dstDir = path.resolve(OUTDIR, to);
  if (fs.existsSync(publicDir)) {
    fs.cp(publicDir, dstDir, { recursive: true });
  }
};
