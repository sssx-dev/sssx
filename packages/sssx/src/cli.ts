#!/usr/bin/env npx tsx

import colors from "ansi-colors";
import { cmd, flags } from "./utils/args.ts";
import { getVersion } from "./utils/version.ts";
import { Timer } from "./utils/timer.ts";

const { bgGreen, bgBlue, bgMagenta, bgCyan, bgWhite, green, dim, bold } =
  colors;
const ALLOWED_COMMANDS = ["dev", "build", "diff", "cluster", "clean", "urls", "info", "init", "serve"];

const showHelp = () => {
  console.log(bold(`\n  SSSX v${getVersion()}`) + dim(" — Fast Svelte Static Site Generator\n"));
  console.log(`  Usage: ${green("sssx")} <command> [options]\n`);
  console.log(`  Commands:\n`);
  console.log(`    ${bgGreen(" dev ")}      Run in development mode`);
  console.log(`                ${dim("sssx dev open")} — open browser automatically`);
  console.log(`                ${dim("sssx dev --port 3000")} — custom port`);
  console.log("");
  console.log(`    ${bgBlue(" build ")}    Build for production (all routes)`);
  console.log(`                ${dim("sssx build <url>")} — build a single URL`);
  console.log("");
  console.log(`    ${green("diff")}       Differential build — only changed pages + affected pages`);
  console.log("");
  console.log(`    ${bgMagenta(" cluster ")}  Build using all CPU cores`);
  console.log("");
  console.log(`    ${bgCyan(" urls ")}     Print URLs matching a prefix`);
  console.log(`                ${dim("sssx urls /blog/")}`);
  console.log("");
  console.log(`    ${bgWhite(" clean ")}    Remove generated output files`);
  console.log("");
  console.log(`    ${green("info")}       Show project info and version`);
  console.log("");
  console.log(`    ${green("init")} ${dim("<name>")}  Scaffold a new project (--template blog|docs|portfolio)`);
  console.log("");
  console.log(`    ${green("serve")}      Serve production build locally`);
  console.log("");
  console.log(`  Flags:\n`);
  console.log(`    ${dim("--help, -h")}     Show this help`);
  console.log(`    ${dim("--version, -v")}  Show version`);
  console.log(`    ${dim("--port <n>")}     Dev server port (default: 8080)`);
  console.log(`    ${dim("--verbose")}      Verbose output`);
  console.log("");
};

const showVersion = () => {
  console.log(`sssx v${getVersion()}`);
};

if (flags.has("version") || flags.has("v")) {
  showVersion();
} else if (
  flags.has("help") ||
  flags.has("h") ||
  !cmd ||
  !ALLOWED_COMMANDS.includes(cmd)
) {
  showHelp();
  if (cmd && !ALLOWED_COMMANDS.includes(cmd)) {
    console.error(colors.red(`  Unknown command: "${cmd}"\n`));
    process.exitCode = 1;
  }
} else {
  const timer = new Timer();
  const path = import.meta.resolve(`./commands/${cmd}.ts`);
  import(path)
    .then(() => {
      if (cmd !== "dev") {
        console.log(dim(`\n  Completed in ${timer.format()}`));
      }
    })
    .catch((err) => {
      console.error(colors.red(`Error running command "${cmd}":`), err);
      process.exitCode = 1;
    });
}
