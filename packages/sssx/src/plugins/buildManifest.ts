import fs from "node:fs";
import path from "node:path";
import { type Config } from "../config.ts";
import { type RouteInfo } from "../routes/types.ts";
import { getVersion } from "../utils/version.ts";

/**
 * Build manifest for deployment tools and CI/CD.
 * Contains metadata about the build output.
 */
export interface BuildManifestData {
  version: string;
  buildTime: string;
  routes: number;
  files: number;
  config: {
    site?: string;
    baseDir?: string;
    defaultLocale?: string;
  };
  assets: {
    js: string[];
    css: string[];
  };
  pages: Array<{
    permalink: string;
    type: string;
    locale: string;
  }>;
}

export const writeBuildManifest = async (
  outdir: string,
  config: Config,
  routes: RouteInfo[]
) => {
  const { globby } = await import("globby");
  const allFiles = await globby(`${outdir}/**/*`);
  const jsFiles = allFiles.filter((f) => f.endsWith(".js")).map((f) => f.replace(outdir, ""));
  const cssFiles = allFiles.filter((f) => f.endsWith(".css")).map((f) => f.replace(outdir, ""));

  const manifest: BuildManifestData = {
    version: getVersion(),
    buildTime: new Date().toISOString(),
    routes: routes.length,
    files: allFiles.length,
    config: {
      site: config.site,
      baseDir: config.baseDir,
      defaultLocale: config.defaultLocale,
    },
    assets: {
      js: jsFiles,
      css: cssFiles,
    },
    pages: routes.map((r) => ({
      permalink: r.permalink,
      type: r.type,
      locale: r.locale || config.defaultLocale || "en-US",
    })),
  };

  fs.writeFileSync(
    path.join(outdir, "build-manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );
};
