import fs from "node:fs";
import path from "node:path";
import { Config } from "../config.ts";
import { globby } from "globby";

const copyFiles = async (src: string, dst: string) => {
  if (fs.existsSync(src)) {
    const list = await globby(`${src}/**/*`);
    for (let i = 0; i < list.length; i++) {
      const srcFile = list[i];
      const relativeFile = srcFile.replace(src, "");
      const dstFile = `${dst}${relativeFile}`;
      const dir = path.parse(dstFile).dir;

      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.cpSync(srcFile, dstFile);
    }
  }
};

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
  await copyFiles(src, dst);
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
