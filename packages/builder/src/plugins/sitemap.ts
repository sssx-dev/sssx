import fs from "fs";
import { RouteInfo } from "../render/routes";
import { Config } from "../utils/config";
import dayjs from "dayjs";

const MAX_URLS_PER_SITEMAP = 5000;

const date = dayjs().format("YYYY-MM-DD");

const cleanUrl = (input: string) => {
  return input
    .replaceAll("//", "/")
    .replace("http:/", "http://")
    .replace("https:/", "https://");
};

const rootSitemap = (config: Config, sitemaps: string[], subdir?: string) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/siteindex.xsd"
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   ${sitemaps
     .map((sitemap) => {
       return `<sitemap>
        <loc>${cleanUrl(
          config.site + (subdir ? `${subdir}/` : "/") + sitemap
        )}</loc>
        <lastmod>${date}</lastmod>
    </sitemap>`;
     })
     .join("\n\t")}
</sitemapindex>
    `;
};

type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

const singleSitemap = (
  config: Config,
  urls: string[],
  changefreq: ChangeFreq = "daily",
  priority = 0.8
) => {
  return `<?xml version='1.0' encoding='UTF-8'?>
    <urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls
          .map((url) => {
            return `<url>
            <loc>${cleanUrl(config.site + url)}</loc>
            <lastmod>${date}</lastmod>
            <changefreq>${changefreq}</changefreq>
            <priority>${priority}</priority>
        </url>`;
          })
          .join("\n\t\t")}
    </urlset>`;
};

export const buildSitemap = async (
  outdir: string,
  config: Config,
  routes: RouteInfo[],
  subdir: string = "sitemaps"
) => {
  let sitemaps: Array<string> = [];

  const sitemapsDir = `${outdir}/${subdir}`;
  if (fs.existsSync(sitemapsDir)) {
    fs.rmSync(sitemapsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(sitemapsDir);

  let index = 0;
  for (let i = 0; i < routes.length; i += MAX_URLS_PER_SITEMAP) {
    const urls = routes
      .slice(i, i + Math.min(routes.length, MAX_URLS_PER_SITEMAP))
      .map((r) => r.permalink);

    const sitemap = singleSitemap(config, urls);
    const filename = `sitemap.${index++}.xml`;
    const sitemapFile = `${sitemapsDir}/${filename}`;
    fs.writeFileSync(sitemapFile, sitemap, "utf-8");
    sitemaps.push(filename);
  }

  const sitemapFile = `${outdir}/sitemap.xml`;
  if (fs.existsSync(sitemapFile)) {
    fs.rmSync(sitemapFile);
  }

  const root = rootSitemap(config, sitemaps, subdir);
  fs.writeFileSync(sitemapFile, root, "utf-8");
};
