import fsSync, { type PathOrFileDescriptor, type WriteFileOptions } from 'fs';
import fs from 'fs/promises';
import dayjs from 'dayjs';
import type { Stream } from 'stream';
import type { Abortable } from 'events';
import type { Mode, ObjectEncodingOptions, OpenMode, PathLike } from 'fs';
import type { FileHandle } from 'fs/promises';
import { config } from '../config/index.js';
import { ensureDirExists } from '../utils/ensureDirExists.js';

const timestamp = dayjs().format(`YYYY-MM-DD-HH-mm-ss`);

const append = (line: string) => {
  const base = `${process.cwd()}/${config.distDir}/files`;
  ensureDirExists(base);
  const filename = `${base}/files-${timestamp}.txt`;
  fs.appendFile(filename, `${line}\n`);
};

export const copyFile = (src: PathLike, dest: PathLike, mode?: number) => {
  append(dest.toString());
  return fs.copyFile(src, dest, mode);
};

export const writeFile = (
  file: PathLike | FileHandle,
  data:
    | string
    | NodeJS.ArrayBufferView
    | Iterable<string | NodeJS.ArrayBufferView>
    | AsyncIterable<string | NodeJS.ArrayBufferView>
    | Stream,
  options?:
    | (ObjectEncodingOptions & {
        mode?: Mode | undefined;
        flag?: OpenMode | undefined;
      } & Abortable)
    | BufferEncoding
    | null
) => {
  append(file.toString());
  return fs.writeFile(file, data, options);
};

export const writeFileSync = (
  file: PathOrFileDescriptor,
  data: string | NodeJS.ArrayBufferView,
  options?: WriteFileOptions
) => {
  append(file.toString());
  return fsSync.writeFileSync(file, data, options);
};

const { existsSync, readFileSync, readdirSync } = fsSync;

export default {
  ...fs,
  copyFile,
  writeFile,
  writeFileSync,

  // sync stuff
  existsSync,
  readFileSync,
  readdirSync
};
