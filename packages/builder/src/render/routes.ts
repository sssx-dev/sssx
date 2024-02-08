import { globby } from "globby";

export type RouteInfo = {
  permalink: string;
  param: Record<string, any>;
  file: string;
  route: string;
};

const PREFIX = `src/pages`;
const PAGE_FILE = `+page.ts`;
const PAGE_SVELTE = `+page.svelte`;

// pull +page.ts files
export const getAllRoutes = async (srcDir: string) => {
  const indexFiles = await globby(`${srcDir}/**/${PAGE_FILE}`);
  const indexes = await Promise.all(
    indexFiles.map(async (file) => await import(file))
  );

  const all: RouteInfo[] = indexes
    .map((module, index) => {
      return module.all().map((param: any) => {
        const file = indexFiles[index];
        const route = file.split(PREFIX)[1].replace(PAGE_FILE, "");
        let permalink = route
          .split("/")
          .filter((a) => !a.startsWith("("))
          .join("/"); // filter out `(group)` folders

        // if it's a string literal, then we need to replace each parameter there
        // TODO: add safety checks here, like a missing key somewhere
        // TODO: do not allow semicolons for production
        Object.keys(param).map((key) => {
          permalink = permalink.replace(`[${key}]`, param[key]);
        });

        return {
          permalink,
          param,
          route,
          file,
        };
      });
    })
    .flat();

  return all;
};

const getPlainRoutes = async (srcDir: string) => {
  const list = (await globby(`${srcDir}/**/${PAGE_SVELTE}`)).map((path) =>
    path.replace(srcDir, "")
  );

  const array: RouteInfo[] = list
    .map((file) => {
      const path = file
        .split("/")
        .filter((a) => !a.startsWith("("))
        .join("/");
      let route = path.split("/").slice(0, -1).join("/");

      if (!route.startsWith("/")) {
        route = `/` + route;
      }

      if (!route.endsWith("/")) {
        route += `/`;
      }

      return {
        // TODO: is there a nicer way to do this, instead re-attaching the path again
        file: `${srcDir}${file}`,
        // path,
        route,
        permalink: route,
        param: {},
      };
    })
    .filter((segment) => {
      // filtering out /some/[slug]/route
      return segment.route.indexOf("[") === -1;
    });

  return array;
};

// TODO: turn this into a proper matching logic
// https://kit.svelte.dev/docs/advanced-routing
export const routeToFileSystem = async (srcDir: string) => {
  const all = await getAllRoutes(srcDir);
  const plain = await getPlainRoutes(srcDir);
  const array = [...all, ...plain];

  console.log(
    "////////////////////////////////////////// routeToFileSystem start"
  );
  console.log(array);
  console.log(
    "////////////////////////////////////////// routeToFileSystem end"
  );
};
