import crypto from "node:crypto";

/** Hash string content and return a short hex digest */
export const hashContent = (
  content: string,
  algorithm: "md5" | "sha1" | "sha256" = "sha256",
  length: number = 8
): string => {
  return crypto.createHash(algorithm).update(content).digest("hex").slice(0, length);
};
