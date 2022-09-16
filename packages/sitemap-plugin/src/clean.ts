import path from 'path';
import { fs } from 'sssx';
import type { Config } from 'sssx';
import type { Options } from './options.js';

export const clean = (options: Options, config: Config) => {
  const dir = path.resolve(process.cwd(), config.outDir);
  const files = fs.readdirSync(dir);

  const sitemaps = files.filter(
    (file) => file.startsWith(`${options.prefix}-`) && file.endsWith(`.xml`)
  );

  sitemaps.map((file) => {
    file = path.resolve(process.cwd(), config.outDir, file);
    console.log(`* Removing old sitemap ${file}`);
    fs.rmSync(file);
  });
};
