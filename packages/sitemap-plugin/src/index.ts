import fs from 'fs';
import path from 'path';
import type { Config, Plugin, Builder } from 'sssx';

const PLUGIN_NAME = `sssx-sitemap-plugin`;

type Options = {
  origin: string;
  exclude: string[];
  changefreq: 'monthly' | 'weekly' | 'daily';
  priority: number;
  /**
   * @param limit maximum number of entries per single sitemap xml
   */
  limit: number;
  sitemapPrefix: string;
  generateRobots: boolean;
  robotsHead: string;
  forceClean: boolean;
};

const defaultOptions: Options = {
  origin: `https://example.org`,
  exclude: [],
  changefreq: 'monthly',
  priority: 0.7,
  limit: 5000,
  sitemapPrefix: `sitemap`,
  generateRobots: true,
  robotsHead: `User-agent: *\nAllow: /`,
  forceClean: true
};

const writeSitemapsIndex = (
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

  fs.writeFileSync(absoluteFilename, [start, ...lines, end].join(`\n`), { encoding: 'utf-8' });
};

const generateRouteSitemaps = (
  routeName: string,
  paths: string[],
  options: Options,
  config: Config
) => {
  let i = 0;
  const filenames: string[] = [];

  while (paths.length !== 0) {
    const filename = `${options.sitemapPrefix}-${routeName.toLowerCase()}-${i++}.xml`;
    const batch = paths.splice(0, Math.min(options.limit, paths.length));
    generateSingleRouteSitemap(filename, batch, options, config);
    filenames.push(filename);
  }

  return filenames;
};

const generateSingleRouteSitemap = (
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
  fs.writeFileSync(absoluteFilename, [start, ...lines, end].join(`\n`), { encoding: 'utf-8' });
};

const clean = (options: Options, config: Config) => {
  const dir = path.resolve(process.cwd(), config.outDir);
  const files = fs.readdirSync(dir);

  const sitemaps = files.filter(
    (file) => file.startsWith(`${options.sitemapPrefix}-`) && file.endsWith(`.xml`)
  );

  sitemaps.map((file) => {
    file = path.resolve(process.cwd(), config.outDir, file);
    console.log(`* Removing old sitemap file ${file}`);
    fs.rmSync(file);
  });
};

const plugin = (inputOptions: Partial<Options> = defaultOptions) => {
  const options = Object.assign({}, inputOptions, defaultOptions);

  const sitemapPlugin: Plugin = async (config: Config, builder: Builder) => {
    if (options.forceClean) {
      clean(options, config);
    }

    console.log(`Generating sitemaps for ${config.origin}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paths: any[] = builder.getPaths();

    const map: Record<string, string[]> = {};

    const { origin, outDir } = config;

    paths.map((o) => {
      const template = o.template.replace(`/index.js`, ``).split(`/`).pop() || '';
      const path = origin + o.path.split(outDir).pop();

      if (!map[template]) map[template] = [];

      map[template].push(path);
    });

    const routes = Object.keys(map);
    let sitemaps: string[] = [];

    routes.map((routeName) => {
      const paths = map[routeName];
      sitemaps = sitemaps.concat(generateRouteSitemaps(routeName, paths, options, config));
    });

    const indexFilename = `${options.sitemapPrefix}.xml`;
    writeSitemapsIndex(indexFilename, sitemaps, options, config);

    const all = [indexFilename, ...sitemaps];
    all.map((sitemap) => console.log(`* Generated ${sitemap.split(`/`).pop()}`));

    if (options.generateRobots) {
      const filename = `robots.txt`;
      const absoluteFilename = path.resolve(process.cwd(), config.outDir, filename);
      const data: string[] = [``];

      data.push(`# Generated using ${PLUGIN_NAME}`);

      all.map((sitemap) => {
        data.push(`Sitemap: ${options.origin}/${sitemap}`);
      });

      fs.writeFileSync(absoluteFilename, [options.robotsHead, ...data].join(`\n`), {
        encoding: 'utf-8'
      });
      console.log(`* Wrote ${filename}`);
    }
  };

  return sitemapPlugin;
};

export default plugin;
