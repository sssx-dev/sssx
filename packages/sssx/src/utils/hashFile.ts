import * as hasha from "hasha";
import type { HashAlgorithm } from "hasha";

export const hashFile = async (
  path: string,
  algorithm: HashAlgorithm = "md5"
) => await hasha.hashFile(path, { algorithm });
