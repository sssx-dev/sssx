import fs from "fs";
import path from "path";
import { globbySync } from "globby";
import { Config } from "../utils/config";
import { cleanURL } from "../utils/cleanURL";
import fm from "front-matter";
import ISO6391 from "iso-639-1";
import * as bcp from "bcp-47";
import { globEscape } from "../utils/globEscape";

const ALL_CODES = ISO6391.getAllCodes();

export const getLocales = async (
  file: string,
  config: Config,
  extension: string
) => {
  let locales = [config.defaultLocale];

  const filename = path.parse(file).name;

  const schema = bcp.parse(filename);
  const isLanguage = ALL_CODES.includes(schema.language as any);
  if (isLanguage) {
    let dir = globEscape(path.dirname(file));
    const pattern = `${dir}/*.${extension}`;
    const list = globbySync(pattern);
    // .map(
    //   (a) => path.parse(a).name
    // );
    // .filter((a) => a !== filename);

    // console.log(dir, schema, list);
    console.log(pattern, list);
  }

  locales = locales.filter(
    (value, index, array) => array.indexOf(value) === index
  );

  return locales;
};
