import { config } from '@sssx/config';
import fsSync, { type PathOrFileDescriptor, type RmOptions, type WriteFileOptions } from 'fs';
import fs from 'fs/promises';
import dayjs from 'dayjs';

import type { Stream } from 'stream';
import type { Abortable } from 'events';
import type { Mode, ObjectEncodingOptions, OpenMode, PathLike } from 'fs';
import type { FileHandle } from 'fs/promises';

import { ensureDirExists } from '../utils/ensureDirExists.js';
import { uniqueFilter } from '../utils/uniqueFilter.js';
import { SEPARATOR } from '../constants.js';

const timestamp = dayjs().format(`YYYY-MM-DD-HH-mm-ss`);

type FileType = 'added' | 'removed';

const getFileName = (name: FileType) => {
  const base = `${process.cwd()}/${config.distDir}/files/${timestamp}`;
  ensureDirExists(base);
  const filename = `${base}/${name}.txt`;

  return filename;
};

const append = (line: string, name: FileType = 'added') => {
  const filename = getFileName(name);
  fs.appendFile(filename, `${line}\n`);
};

const rmSync = (path: string, options?: RmOptions) => {
  append(path, 'removed');
  fsSync.rmSync(path, options);
};

const rm = (path: string, options?: RmOptions) => {
  append(path, 'removed');
  fsSync.rmSync(path, options);
};

const sortFile = () => {
  sortOneFile('added');
  sortOneFile('removed');
};

const sortOneFile = (name: FileType = 'added') => {
  const filename = getFileName(name);

  if (!existsSync(filename)) return;

  const lines = fsSync
    .readFileSync(filename, { encoding: 'utf-8' })
    .split(`\n`)
    .map((a) =>
      a
        .replaceAll(`${SEPARATOR}${SEPARATOR}`, SEPARATOR)
        .replaceAll(`${process.cwd()}${SEPARATOR}`, ``)
    )
    .sort()
    .filter((a) => a.trim().length > 0)
    .filter(uniqueFilter);

  fsSync.writeFileSync(filename, lines.join(`\n`), { encoding: 'utf-8' });
};

//////////// stubs for origina fs functions below

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

const { existsSync, readFileSync, readdirSync, mkdirSync } = fsSync;

// TODO: proxy fs.cp function?

export default {
  ...fs,
  copyFile,
  writeFile,
  writeFileSync,
  rm,
  rmSync,

  // sync fs stubs
  existsSync,
  readFileSync,
  readdirSync,
  mkdirSync,

  // sssx specific functions
  sortFile
};
