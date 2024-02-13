import fs from "fs";
import path from "path";
import { uniqueFilter } from "../utils/uniqueFilter";
import { SSSX_BANNER, SSSX_URLS_INDEX } from "../utils/constants";
import { arrayToFile } from "../utils/arrayToFile";
import { loadExistingModule } from "./loadExistingModule";
import { getFullPath } from "./getFullPath";

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
