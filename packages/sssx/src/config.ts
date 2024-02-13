import { Postcss } from "svelte-preprocess/dist/types/options";
import { Pluggable, Plugin, PluggableList } from "unified";

// draw inspirations from:
// https://nextjs.org/docs/app/api-reference/next-config-js
// https://kit.svelte.dev/docs/configuration
// https://elderguide.com/tech/elderjs/#config-elderconfigjs
// https://docs.astro.build/en/reference/configuration-reference/
export type Config = {
  title?: string;
  assets: string;
  outDir: string;
  site?: string;
  // baseDir?: string; // a base dir where website will be hosted
  postcss: Postcss;
  rehypePlugins: PluggableList | Pluggable[] | Plugin[];
  defaultLocale: string;
  globalDir: string;
  writeURLsIndex: boolean;
  writeFilesIndex: boolean;
};

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

// TODO: create type for config
export const getConfig = async (cwd: string): Promise<Config> => {
  const projectConfig = (await import(`${cwd}/sssx.config.ts`)).default;
  const config = { ...defaultConfig, ...projectConfig };

  return config;
};
