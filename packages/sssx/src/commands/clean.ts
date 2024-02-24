import fs from "node:fs";
import { getConfig } from "../config.ts";
import { SSSX_FILES_INDEX, SSSX_URLS_INDEX } from "../utils/constants.ts";
import { cwd } from "../utils/cwd.ts";
import { done } from "../utils/done.ts";

const config = await getConfig(cwd);

const outdir = `${cwd}/${config.outDir}`;
const sssxFiles = `${cwd}/${SSSX_FILES_INDEX}`;
const sssxUrls = `${cwd}/${SSSX_URLS_INDEX}`;

if (fs.existsSync(outdir)) {
  fs.rmSync(outdir, { recursive: true, force: true });
}

if (fs.existsSync(sssxFiles)) fs.rmSync(sssxFiles);
if (fs.existsSync(sssxUrls)) fs.rmSync(sssxUrls);

await done();
