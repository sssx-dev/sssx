import path from 'path';
import { fs } from 'sssx';
import type { Config } from '@sssx/config';
import type { Options } from './options.js';
import { XML_PREFIX } from './constants.js';

export const generateSingleRouteSitemap = (
  filename: string,
  paths: string[],
  options: Options,
  config: Config
) => {
  const start = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  const end = `</urlset>`;
  const d = new Date();
  const date = [d.getFullYear(), d.getMonth(), d.getDate()].join(`-`);

  const lines: string[] = [];

  paths.map((path) => {
    lines.push(`<url>`);
    lines.push(`\t<loc>${path}</loc>`);
    lines.push(`\t<lastmod>${date}</lastmod>`);
    lines.push(`\t<changefreq>${options.changefreq}</changefreq>`);
    lines.push(`\t<priority>${options.priority}</priority>`);
    lines.push(`</url>`);
  });

  const absoluteFilename = path.resolve(process.cwd(), config.outDir, filename);
  fs.writeFileSync(absoluteFilename, [XML_PREFIX, start, ...lines, end].join(`\n`), {
    encoding: 'utf-8'
  });
};
