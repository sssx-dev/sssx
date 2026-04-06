// @ts-ignore
let all: string[] = process
  ? process.argv.slice(2)
  : // @ts-ignore
    Deno.args;

/** Parse --flag and --key=value / --key value pairs */
export const flags = new Map<string, string | true>();

const positional: string[] = [];
for (let i = 0; i < all.length; i++) {
  const arg = all[i];
  if (arg.startsWith("--")) {
    const key = arg.slice(2);
    if (key.includes("=")) {
      const [k, v] = key.split("=", 2);
      flags.set(k, v);
    } else if (i + 1 < all.length && !all[i + 1].startsWith("-")) {
      flags.set(key, all[++i]);
    } else {
      flags.set(key, true);
    }
  } else if (arg.startsWith("-") && arg.length === 2) {
    flags.set(arg.slice(1), true);
  } else {
    positional.push(arg);
  }
}

export const [cmd, ...args] = positional;
