import fs from "fs";
import { Config } from "./config";

/**
 * Copy assets from a public folder into the output folder
 * @param dst
 * @param cwd
 * @param config
 */
export const copyAssets = async (dst: string, cwd: string, config: Config) => {
  const src = `${cwd}/${config.assets}`;

  if (fs.existsSync(src)) {
    fs.cpSync(src, dst, { recursive: true });
  }
};
