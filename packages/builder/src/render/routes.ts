import fs from "fs";
import fm from "front-matter";
import { globby } from "globby";
import { cleanURL } from "../utils/cleanURL";
import path from "path";
import { Config } from "../utils/config";

// TODO: design a better architecture that would allow for streaming millions of pages
// storing them all in memory is not a best design right now

type Params = Record<string, any>;
export interface RouteModule {
  all: () => Params[];
  request: (params: Params) => Record<string, any>;
}

export type RouteInfo = {
  permalink: string;
  param: Record<string, any>;
  file: string;
  route: string;
  svelte?: string;
  module?: RouteModule;
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
        svelte: PAGE_SVELTE,
        route: `./pages${route}`,
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

const MARKDOWN = "md";
const getContentRoutes = async (cwd: string, config: Config) => {
  const srcDir = `${cwd}/src/content`;
  const list = (await globby(`${srcDir}/**/*.${MARKDOWN}`)).map((path) =>
    path.replace(srcDir, "")
  );
  const full = list.map((route) => {
    const file = cleanURL(`${srcDir}/${route}`);
    const content = fs.readFileSync(file, "utf8");
    //@ts-ignore
    const frontmatter = fm(content);
    const attributes: Record<string, any> = frontmatter.attributes as any;

    let permalink = route
      .split("/")
      .filter((a) => !a.startsWith("("))
      .join("/")
      .replace(`.${MARKDOWN}`, ``);

    if (permalink.endsWith(config.defaultLocale)) {
      permalink = permalink.split(config.defaultLocale)[0];
    }

    if (!permalink.endsWith("/")) {
      permalink += "/";
    }

    // because of how we will compile this later inside `generateEntryPoint.ts`
    route = "/";
    let svelte = undefined;

    if (attributes.template) {
      const array = attributes.template.split("/");
      const prefix = array.slice(0, -1);
      svelte = array.pop()!;
      route = path.normalize(`${cwd}/src/${prefix.join("/")}`);
    }

    if (!route.endsWith("/")) {
      route += "/";
    }

    return {
      file,
      route,
      svelte,
      permalink,
      param: attributes,
    };
  });

  return full;
};

export const getAllRoutes = async (cwd: string, config: Config) => {
  const srcDir = `${cwd}/src/pages`;
  const all = await getFileSystemRoutes(srcDir);
  const plain = await getPlainRoutes(srcDir);
  const content = await getContentRoutes(cwd, config);
  const array = [...all, ...plain, ...content];

  return array;
};

// TODO: turn this into a proper matching logic
// https://kit.svelte.dev/docs/advanced-routing
export const routeToFileSystem = async (
  cwd: string,
  route: string,
  allRoutes: RouteInfo[]
): Promise<RouteInfo | undefined> => {
  const filtered = allRoutes.filter((segment) => segment.permalink === route);

  // return first found mathcing permalink
  if (filtered.length > 0) {
    return filtered[0];
  }

  return undefined;
};
