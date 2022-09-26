import path from 'path';
import { OUTDIR, config } from '@sssx/config';
import fs from '../lib/fs.js';

export const copyPublic = async () => {
  const publicDir = path.resolve(process.cwd(), config.publicDir);
  const dstDir = OUTDIR;
  if (fs.existsSync(publicDir)) {
    fs.cp(publicDir, dstDir, { recursive: true });
  }
};
