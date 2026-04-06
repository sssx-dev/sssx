import fs from "node:fs";
import type { Pluggable, Plugin, PluggableList } from "unified";
import type { SSSXPlugin } from "./plugins/types.ts";
import type { SSSXTheme } from "./themes/types.ts";

const SSSX_CONFIG_FILE = `sssx.config.ts`;

/** SSSX configuration, stored in `sssx.config.ts` */
export type Config = Partial<{
  /** default title to use if it's not provided by the template or content */
  title?: string;
  /** folder with the public assets to be copied, @default public */
  assets: string;
  /** Output dir with all files @default .sssx  */
  outDir: string;
  /** a website name like https://example.com */
  site?: string;
  /** a base dir where website will be hosted */
  baseDir?: string;
  /** rehype markdown plugins */
  rehypePlugins: PluggableList | Pluggable[] | Plugin[];
  /** default locale, @default en-US */
  defaultLocale: string;
  /** global dir to store assets via `image.jpg?global` @default global */
  globalDir: string;
  /** dump all urls into `sssx.urls.ts` */
  writeURLsIndex: boolean;
  /** dump all files into `sssx.files.ts` */
  writeFilesIndex: boolean;
  /** SSSX plugins for build lifecycle hooks */
  plugins: SSSXPlugin[];
  /** Theme configuration — path or theme object */
  theme: string | SSSXTheme;
  /** Minify output in production @default true */
  minify: boolean;
  /** Generate RSS feed @default true */
  rss: boolean;
  /** Generate 404 page @default true */
  generate404: boolean;
  /** Generate search index @default true */
  search: boolean;
  /** CDN prefix for assets (e.g., "https://cdn.example.com") */
  cdnPrefix: string;
  /** Pre-compress output with gzip/brotli @default false */
  compress: boolean;
  /** Check for broken internal links after build @default false */
  checkLinks: boolean;
  /** Generate deploy diff manifest @default false */
  deployDiff: boolean;
}>;

const defaultConfig: Config = {
  assets: "public",
  outDir: ".sssx",
  title: "Default Title",
  defaultLocale: "en-US",
  globalDir: "global",
  rehypePlugins: [],
  writeURLsIndex: false,
  writeFilesIndex: false,
  plugins: [],
  minify: true,
  rss: true,
  generate404: true,
  search: true,
  compress: false,
  checkLinks: false,
  deployDiff: false,
};

export const getConfig = async (cwd: string): Promise<Config> => {
  const configPath = `${cwd}/${SSSX_CONFIG_FILE}`;

  if (!fs.existsSync(configPath)) {
    console.warn(
      `Warning: No ${SSSX_CONFIG_FILE} found in ${cwd}. Using default configuration.`
    );
    return { ...defaultConfig };
  }

  try {
    const projectConfig = (await import(configPath)).default;
    const config = { ...defaultConfig, ...projectConfig };
    return config;
  } catch (err) {
    throw new Error(
      `Failed to load ${SSSX_CONFIG_FILE} from ${cwd}: ${err instanceof Error ? err.message : String(err)}`
    );
  }
};
