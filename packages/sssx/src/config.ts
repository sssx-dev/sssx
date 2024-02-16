import path from "node:path";
import { Postcss } from "svelte-preprocess/dist/types/options";
import { Pluggable, Plugin, PluggableList } from "unified";

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
  /** postcss plugins */
  postcss: Postcss;
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
}>;

const defaultConfig: Config = {
  assets: "public",
  outDir: ".sssx",
  postcss: {},
  title: "Default Title",
  defaultLocale: "en-US",
  globalDir: "global",
  rehypePlugins: [],
  writeURLsIndex: false,
  writeFilesIndex: false,
};

export const getConfig = async (cwd: string): Promise<Config> => {
  const projectConfig = (await import(`${cwd}/${SSSX_CONFIG_FILE}`)).default;
  const config = { ...defaultConfig, ...projectConfig };

  return config;
};
