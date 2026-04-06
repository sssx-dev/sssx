import type { BuildOptions, LogLevel } from "esbuild";

export const getCommonBuildOptions = (logLevel: LogLevel = "info") => {
  return {
    bundle: true,
    mainFields: ["svelte", "browser", "module", "main"],
    conditions: ["svelte", "browser"],
    logLevel,
    minify: false,
    splitting: true,
    write: true,
    format: `esm`,
  } as BuildOptions;
};
