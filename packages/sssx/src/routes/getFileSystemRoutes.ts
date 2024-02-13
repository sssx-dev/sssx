import { globby } from "globby";
import { RouteInfo, RouteModule } from "./types";
import { getDefaultLocales } from "../utils/getLocales";
import { Config } from "../config";

const PREFIX = `src/pages`;
const PAGE_FILE = `+page.ts`;
const PAGE_SVELTE = `+page.svelte`;

// pull +page.ts files
export const getFileSystemRoutes = async (srcDir: string, config: Config) => {
  let locales = getDefaultLocales(config);
  const indexFiles = await globby(`${srcDir}/**/${PAGE_FILE}`);
  const indexes = await Promise.all(
    indexFiles.map(async (file) => await import(file))
  );

  const all: RouteInfo[] = indexes
    .map((module: RouteModule, index) => {
      return module.all().map((param: any) => {
        const file = indexFiles[index];
        const route = file.split(PREFIX)[1].replace(PAGE_FILE, "");
        let permalink = route
          .split("/")
          .filter((a) => !a.startsWith("("))
          .join("/"); // filter out `(group)` folders

        // TODO: add safety checks here, like a missing key somewhere or incorrect symbol
        Object.keys(param).map((key) => {
          permalink = permalink.replace(`[${key}]`, param[key]);
        });

        return {
          permalink,
          param,
          route: `./pages${route}`,
          file,
          svelte: PAGE_SVELTE,
          module,
          locales,
        };
      });
    })
    .flat();

  return all;
};
