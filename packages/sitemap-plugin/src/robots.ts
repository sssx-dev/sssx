import path from 'path';
import { fs } from 'sssx';
import type { Config } from 'sssx';
import type { Options } from './options.js';
import { PLUGIN_NAME } from './constants.js';

export const robots = (options: Options, config: Config, sitemaps: string[]) => {
  const filename = `robots.txt`;
  const absoluteFilename = path.resolve(process.cwd(), config.outDir, filename);
  const data: string[] = [``];

  data.push(`# Generated using ${PLUGIN_NAME}`);

  sitemaps.map((sitemap) => {
    data.push(`Sitemap: ${options.origin}/${sitemap}`);
  });

  fs.writeFileSync(absoluteFilename, [options.robotsHead, ...data].join(`\n`), {
    encoding: 'utf-8'
  });
  console.log(`* Generated ${filename}`);
};
