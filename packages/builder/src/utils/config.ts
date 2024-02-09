export type Config = {
  title?: string;
  assets: string;
};

const defaultConfig: Config = {
  assets: "public",
};

// TODO: create type for config
export const getConfig = async (cwd: string): Promise<Config> => {
  const projectConfig = (await import(`${cwd}/sssx.config.ts`)).default;
  const config = { ...defaultConfig, ...projectConfig };

  return config;
};
