import path from "path";

export const getFullPath = (cwd: string, filename: string) =>
  path.normalize(`${cwd}/${filename}`);
