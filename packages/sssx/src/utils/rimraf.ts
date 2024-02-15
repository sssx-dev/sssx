import fs from "node:fs";
import fsExtra from "fs-extra";

export const rimraf = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  } else {
    fsExtra.emptyDirSync(dir);
  }
};
