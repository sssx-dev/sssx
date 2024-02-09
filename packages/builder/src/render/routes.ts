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
export const getFileSystemRoutes = async (srcDir: string) => {
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

const checkSlashes = (input: string) => {
  if (!input.startsWith("/")) {
    input = `/` + input;
  }

  if (!input.endsWith("/")) {
    input += `/`;
  }

  return input;
};

const getPlainRoutes = async (srcDir: string) => {
  const list = (await globby(`${srcDir}/**/${PAGE_SVELTE}`)).map((path) =>
    path.replace(srcDir, "")
  );

  const array: RouteInfo[] = list
    .map((file) => {
      let route = file.split("/").slice(0, -1).join("/");
      const permalink = checkSlashes(
        route
          .split("/")
          // filtering out /some/(group)/slug -> /some//slug
          .filter((a) => !a.startsWith("("))
          .join("/")
      );

      route = checkSlashes(route);

      return {
        // TODO: is there a nicer way to do this, instead re-attaching the path again
        file: `${srcDir}${file}`,
        route,
        permalink,
        param: {},
      };
    })
    .filter((segment) => {
      // filtering out /some/[slug]/route
      return segment.route.indexOf("[") === -1;
    });

  return array;
};

export const getAllRoutes = async (srcDir: string) => {
  const all = await getFileSystemRoutes(srcDir);
  const plain = await getPlainRoutes(srcDir);
  const array = [...all, ...plain];

  return array;
};

// TODO: turn this into a proper matching logic
// https://kit.svelte.dev/docs/advanced-routing
export const routeToFileSystem = async (
  srcDir: string,
  route: string
): Promise<RouteInfo | undefined> => {
  const all = await getAllRoutes(srcDir);

  const filtered = all.filter((segment) => segment.permalink === route);

  // console.log(
  //   "////////////////////////////////////////// routeToFileSystem start"
  // );
  // console.log(all);
  // console.log(filtered);
  // console.log(
  //   "////////////////////////////////////////// routeToFileSystem end"
  // );

  // return first found mathcing permalink
  if (filtered.length > 0) {
    return filtered[0];
  }

  return undefined;
};
