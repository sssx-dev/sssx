import fs from "node:fs";
import colors from "ansi-colors";
import { getConfig } from "../config.ts";
import { SSSX_FILES_INDEX, SSSX_URLS_INDEX } from "../utils/constants.ts";
import { cwd } from "../utils/cwd.ts";
import { done } from "../utils/done.ts";

const { dim, green } = colors;

const config = await getConfig(cwd);

const outdir = `${cwd}/${config.outDir}`;
const sssxFiles = `${cwd}/${SSSX_FILES_INDEX}`;
const sssxUrls = `${cwd}/${SSSX_URLS_INDEX}`;

let cleaned = 0;

if (fs.existsSync(outdir)) {
  fs.rmSync(outdir, { recursive: true, force: true });
  console.log(dim(`  ${green("✓")} Removed ${config.outDir}/`));
  cleaned++;
}

if (fs.existsSync(sssxFiles)) {
  fs.rmSync(sssxFiles);
  console.log(dim(`  ${green("✓")} Removed ${SSSX_FILES_INDEX}`));
  cleaned++;
}

if (fs.existsSync(sssxUrls)) {
  fs.rmSync(sssxUrls);
  console.log(dim(`  ${green("✓")} Removed ${SSSX_URLS_INDEX}`));
  cleaned++;
}

if (cleaned === 0) {
  console.log(dim("  Nothing to clean."));
}

await done();
