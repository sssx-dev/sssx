import fs from "node:fs";
import { type Module } from "./types.ts";

export const loadExistingModule = async (fullpath: string) => {
  if (fs.existsSync(fullpath)) {
    const rand = Math.random().toString().slice(2);
    const module: Module = await import(`${fullpath}?${rand}`);
    return module;
  }

  return {
    all: [],
    added: [],
    removed: [],
  } as Module;
};
