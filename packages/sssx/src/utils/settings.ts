import type { BuildOptions, LogLevel } from "esbuild";

export const enableSourcemap = false;
export const logLevel = `info`; // TODO: get this from env variable
export const sourcemap = "inline";
export const prettify = false;
export const minify = true;

export const getCommonBuildOptions = (logLevel: LogLevel = "info") => {
  return {
    bundle: true,
    // outdir,
    mainFields: ["svelte", "browser", "module", "main"],
    conditions: ["svelte", "browser"],
    logLevel,
    minify: false, //so the resulting code is easier to understand
    splitting: true,
    write: true,
    format: `esm`,
  } as BuildOptions;
};
