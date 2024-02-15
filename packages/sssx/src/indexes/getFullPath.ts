import path from "node:path";

export const getFullPath = (cwd: string, filename: string) =>
  path.normalize(`${cwd}/${filename}`);
