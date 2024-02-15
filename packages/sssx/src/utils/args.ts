// @ts-ignore
export const [cmd, ...args]: string[] = process
  ? process.argv.slice(2)
  : // @ts-ignore
    Deno.args;
