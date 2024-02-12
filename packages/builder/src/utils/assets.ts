import fs from "fs";
import path from "path";
import { Config } from "./config";
import { globby } from "globby";

/**
 * Copy assets from a public folder into the output folder
 * @param dst
 * @param cwd
 * @param config
 */
export const copyPublicAssets = async (
  dst: string,
  cwd: string,
  config: Config
) => {
  const src = `${cwd}/${config.assets}`;

  if (fs.existsSync(src)) {
    fs.cpSync(src, dst, { recursive: true });
  }
};

export const copyAssets = async (
  srcDir: string,
  outdir: string,
  excludeFilter = [/^.*\.md$/]
) => {
  const list = await globby(`${srcDir}/*`);
  list.map((file: string) => {
    let ignore = false;
    excludeFilter.map((filter: RegExp) => {
      if (file.match(filter)) {
        ignore = true;
      }
    });
    if (!ignore) {
      const src = file.replace(srcDir, "");
      const dst = path.normalize(`${outdir}${src}`);
      // console.log({ file, dst });
      fs.cpSync(file, dst);
    }
  });
};
