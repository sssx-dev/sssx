#!/usr/bin/env npx tsx

import chalk from "chalk";
import { cmd } from "./utils/args.ts";

const ALLOWED_COMMANDS = ["dev", "build", "cluster", "clean", "urls"];

if (!ALLOWED_COMMANDS.includes(cmd)) {
  console.log(`Usage:`);
  console.log(`\t$ sssx <input>`);
  console.log("");
  console.log(`\t${chalk.bgGreen("dev")} – run in development mode`);
  console.log(
    `\t\t${chalk.bgGreen(
      "dev open"
    )} – if you want to open url in browser automatically`
  );
  console.log("");
  console.log(
    `\t${chalk.bgBlue("build")} – run in production mode (and build all)`
  );
  console.log(
    `\t\t${chalk.bgBlue(
      "build <url>"
    )} – run in production mode and build only single <url>`
  );
  console.log("");
  console.log(
    `\t${chalk.bgMagenta(
      "cluster"
    )} – run in cluster production mode and use all CPU cores (and build all)`
  );
  console.log("");
  console.log(
    `\t${chalk.bgCyan("urls prefix")} – prints urls with a given prefix`
  );
  console.log("");
  console.log(`\t${chalk.bgWhite("clean")} – cleans existing files`);
} else {
  await import(`./commands/${cmd}.ts`);
}
