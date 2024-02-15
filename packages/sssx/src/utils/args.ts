// @ts-ignore
let all: string[] = process
  ? process.argv.slice(2)
  : // @ts-ignore
    Deno.args;

all = all.filter((a) => !a.startsWith("--"));

export const [cmd, ...args] = all;

console.log({ cmd, args });
