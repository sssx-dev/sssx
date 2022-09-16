import path from 'path';
import { fs } from 'sssx';
import type { Config } from 'sssx';
import type { Options } from './options.js';
import { XML_PREFIX } from './constants.js';

export const writeSitemapsIndex = (
  filename: string,
  sitemaps: string[],
  options: Options,
  config: Config
) => {
  const start = `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/siteindex.xsd">`;
  const end = `</sitemapindex>`;

  const absoluteFilename = path.resolve(process.cwd(), config.outDir, filename);
  const lines: string[] = [];

  sitemaps.map((sitemap) => {
    const url = options.origin + sitemap.split(`/${config.outDir}`).pop();
    lines.push(`<sitemap>`);
    lines.push(`\t<loc>${url}</loc>`);
    lines.push(`</sitemap>`);
  });

  fs.writeFileSync(absoluteFilename, [XML_PREFIX, start, ...lines, end].join(`\n`), {
    encoding: 'utf-8'
  });
};
