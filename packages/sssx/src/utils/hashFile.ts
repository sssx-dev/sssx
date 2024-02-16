import fs from "node:fs";
import crypto from "node:crypto";

export const hashFile = async (
  path: string,
  algorithm: "md5" | "sha1" | "sha256" = "md5"
) => {
  const data = fs.readFileSync(path);
  const hash = crypto.createHash(algorithm).update(data).digest("hex");
  return hash;
};
