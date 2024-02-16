#!/usr/bin/env npx tsx

import colors from "ansi-colors";
import { cmd } from "./utils/args.ts";

const {bgGreen, bgBlue, bgMagenta, bgCyan, bgWhite} = colors;
const ALLOWED_COMMANDS = ["dev", "build", "cluster", "clean", "urls"];

if (!ALLOWED_COMMANDS.includes(cmd)) {
  console.log(`Usage:`);
  console.log(`\t$ sssx <input>`);
  console.log("");
  console.log(`\t${bgGreen("dev")} – run in development mode`);
  console.log(
    `\t\t${bgGreen(
      "dev open"
    )} – if you want to open url in browser automatically`
  );
  console.log("");
  console.log(
    `\t${bgBlue("build")} – run in production mode (and build all)`
  );
  console.log(
    `\t\t${bgBlue(
      "build <url>"
    )} – run in production mode and build only single <url>`
  );
  console.log("");
  console.log(
    `\t${bgMagenta(
      "cluster"
    )} – run in cluster production mode and use all CPU cores (and build all)`
  );
  console.log("");
  console.log(
    `\t${bgCyan("urls prefix")} – prints urls with a given prefix`
  );
  console.log("");
  console.log(`\t${bgWhite("clean")} – cleans existing files`);
} else {
  const path = import.meta.resolve(`./commands/${cmd}.ts`)
  // await import(`./commands/${cmd}.ts`);
  // await import(path);
  import(path).catch(err => console.error(err));
}
