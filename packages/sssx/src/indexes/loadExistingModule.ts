import fs from "fs";
import { Module } from "./types";

export const loadExistingModule = async (fullpath: string) => {
  if (fs.existsSync(fullpath)) {
    const rand = Math.random().toString().slice(2);
    // hack: to prevent module import caching, we add a random number as a url parameter
    // revisit this for deno
    const module: Module = await import(`${fullpath}?${rand}`);
    return module;
  }

  return {
    all: [],
    added: [],
    removed: [],
  } as Module;
};
