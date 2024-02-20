/** this was crucial to have to be able to run ts-node, because in tsx this would not run without it at all! */
export const execArgv = [
  "--require",
  "ts-node/register",
  "--import",
  'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("ts-node/esm", pathToFileURL("./"));',
  "--trace-warnings",
];
