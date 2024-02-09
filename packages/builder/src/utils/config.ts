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
};

const defaultConfig: Config = {
  assets: "public",
  outDir: ".sssx",
};

// TODO: create type for config
export const getConfig = async (cwd: string): Promise<Config> => {
  const projectConfig = (await import(`${cwd}/sssx.config.ts`)).default;
  const config = { ...defaultConfig, ...projectConfig };

  return config;
};
