import path from 'path';
import { OUTDIR } from '@sssx/config';
import fs from '../lib/fs.js';

export const copyPublic = async () => {
  const publicDir = path.resolve(process.cwd(), `public`);
  const dstDir = OUTDIR;
  if (fs.existsSync(publicDir)) {
    fs.cp(publicDir, dstDir, { recursive: true });
  }
};
