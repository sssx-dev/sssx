import fs from "fs";
import { uniqueFilter } from "../utils/uniqueFilter";
import { Config } from "../utils/config";
import { globby } from "globby";
import { SSSX_BANNER, SSSX_FILES_INDEX } from "../utils/constants";
import { arrayToFile } from "../utils/arrayToFile";
import { getFullPath } from "./getFullPath";
import { loadExistingModule } from "./loadExistingModule";
import { loadExistingUrlsModule } from "./writeURLsIndex";

// TODO: figure out removal of the files here
export const writeFilesIndex = async (cwd: string, config: Config) => {
  const dir = `${cwd}/${config.outDir}`;
  const files = (await globby(`${dir}/**/*`)).map((a) => a.replace(dir, ""));

  const fullpath = getFullPath(cwd, SSSX_FILES_INDEX);
  const oldFiles = (await loadExistingModule(fullpath)).all;
  const removedURLs = (await loadExistingUrlsModule(cwd)).removed;
  const added = files.filter((file) => !oldFiles.includes(file));

  // because we might be generating route by route, lets defer to removed urls here
  // const removed = oldFiles.filter((file) => !files.includes(file));

  // console.log({ oldFiles });
  // console.log({ removedURLs });

  const removed = oldFiles.filter((file) => {
    let isRemoved = false;

    for (let i = 0; i < removedURLs.length; i++) {
      const url = removedURLs[i];
      if (file.startsWith(url)) {
        isRemoved = true;
        break;
      }
    }

    return isRemoved;
  });

  const all = [...files, ...oldFiles]
    .filter(uniqueFilter)
    .filter((file) => !removed.includes(file))
    .sort();

  let data = SSSX_BANNER;
  data += arrayToFile(all, "all") + `\n`;
  data += arrayToFile(added, "added") + `\n`;
  data += arrayToFile(removed, "removed") + `\n`;

  fs.writeFileSync(fullpath, data, "utf8");
};
