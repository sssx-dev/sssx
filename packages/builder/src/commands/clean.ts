import fs from "fs";
import { getConfig } from "../utils/config";
import { SSSX_FILES_INDEX, SSSX_URLS_INDEX } from "../utils/constants";

const cwd = process.cwd();
const config = await getConfig(cwd);

const outdir = `${cwd}/${config.outDir}`;
const sssxFiles = `${cwd}/${SSSX_FILES_INDEX}`;
const sssxUrls = `${cwd}/${SSSX_URLS_INDEX}`;

if (fs.existsSync(outdir)) {
  fs.rmSync(outdir, { recursive: true, force: true });
}

if (fs.existsSync(sssxFiles)) fs.rmSync(sssxFiles);
if (fs.existsSync(sssxUrls)) fs.rmSync(sssxUrls);

console.log("DONE");
