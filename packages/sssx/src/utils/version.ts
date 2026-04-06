import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let _version: string | null = null;

/** Returns the current SSSX package version from package.json */
export const getVersion = (): string => {
  if (_version) return _version;

  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const pkgPath = path.resolve(__dirname, "../../package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    _version = pkg.version;
    return _version!;
  } catch {
    return "0.0.0";
  }
};
