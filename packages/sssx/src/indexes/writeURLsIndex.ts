import fs from "node:fs";
import { uniqueFilter } from "../utils/uniqueFilter.ts";
import { SSSX_BANNER, SSSX_URLS_INDEX } from "../utils/constants.ts";
import { arrayToFile } from "../utils/arrayToFile.ts";
import { loadExistingModule } from "./loadExistingModule.ts";
import { getFullPath } from "./getFullPath.ts";

export const loadExistingUrlsModule = async (cwd: string) => {
  const fullpath = getFullPath(cwd, SSSX_URLS_INDEX);
  const module = await loadExistingModule(fullpath);
  return module;
};

export const writeURLsIndex = async (cwd: string, urls: string[]) => {
  const fullpath = getFullPath(cwd, SSSX_URLS_INDEX);
  const oldURLs = (await loadExistingModule(fullpath)).all;
  const added = urls.filter((url) => !oldURLs.includes(url));
  const removed = oldURLs.filter((url) => !urls.includes(url));
  const all = [...urls, ...oldURLs]
    .filter(uniqueFilter)
    .filter((url) => !removed.includes(url))
    .sort();

  let data = SSSX_BANNER;
  data += arrayToFile(all, "all") + `\n`;
  data += arrayToFile(added, "added") + `\n`;
  data += arrayToFile(removed, "removed") + `\n`;

  fs.writeFileSync(fullpath, data, "utf8");
};
