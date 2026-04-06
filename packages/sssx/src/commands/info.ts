import os from "node:os";
import fs from "node:fs";
import { cwd } from "../utils/cwd.ts";
import { getConfig } from "../config.ts";
import { getVersion } from "../utils/version.ts";
import { getAllRoutes } from "../routes/index.ts";
import colors from "ansi-colors";

const { bold, dim, green, cyan } = colors;

const config = await getConfig(cwd);
const allRoutes = await getAllRoutes(cwd, config);

const plain = allRoutes.filter((r) => r.type === "plain").length;
const filesystem = allRoutes.filter((r) => r.type === "filesystem").length;
const content = allRoutes.filter((r) => r.type === "content").length;

console.log(bold(`\n  SSSX Project Info\n`));
console.log(`  ${dim("Version:")}      ${green(`v${getVersion()}`)}`);
console.log(`  ${dim("Node:")}         ${process.version}`);
console.log(`  ${dim("Platform:")}     ${os.platform()} ${os.arch()}`);
console.log(`  ${dim("CPUs:")}         ${os.cpus().length}`);
console.log(`  ${dim("CWD:")}          ${cwd}`);
console.log(`  ${dim("Output:")}       ${config.outDir}`);
console.log(`  ${dim("Site:")}         ${config.site || "(not set)"}`);
console.log(`  ${dim("Locale:")}       ${config.defaultLocale}`);
console.log("");
console.log(`  ${bold("Routes:")}       ${cyan(String(allRoutes.length))} total`);
console.log(`    ${dim("Plain:")}       ${plain}`);
console.log(`    ${dim("Filesystem:")}  ${filesystem}`);
console.log(`    ${dim("Content:")}     ${content}`);

const outdir = `${cwd}/${config.outDir}`;
if (fs.existsSync(outdir)) {
  const { globby } = await import("globby");
  const files = await globby(`${outdir}/**/*`);
  console.log(`\n  ${dim("Built files:")}  ${files.length}`);
}

console.log("");
