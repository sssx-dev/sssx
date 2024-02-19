import fs from "node:fs";
import path from "node:path";
import { globby } from "globby";
import { type Config } from "../config.ts";
import { cleanURL } from "../utils/cleanURL.ts";
import fm from "front-matter";
import { getLocales } from "../utils/getLocales.ts";
import { type RouteInfo } from "./types.ts";
import { replacePermalinkSlugsWithValues } from "../utils/replacePermalinkSlugsWithValues.ts";

const MARKDOWN = "md";

const loadRoute = async (
  cwd: string,
  config: Config,
  srcDir: string,
  route: string,
  extension: string
) => {
  const file = cleanURL(`${srcDir}/${route}`);

  let locale = config.defaultLocale;
  const locales = getLocales(file, config, extension);
  const content = fs.readFileSync(file, "utf8");
  //@ts-ignore
  const frontmatter = fm(content);
  const attributes: Record<string, any> = frontmatter.attributes as any;

  let permalink = route
    .split("/")
    .filter((a) => !a.startsWith("("))
    .join("/")
    .replace(`.${extension}`, ``);

  // replace dynamic slugs inside permalink
  permalink = replacePermalinkSlugsWithValues(permalink, attributes);

  // shuffle locale to the front
  if (locales.length > 1) {
    let array = permalink.split("/").filter((a) => a.length > 0);
    locale = array.pop();
    permalink = [locale, ...array].join("/");
  }

  if (!permalink.endsWith("/")) {
    permalink += "/";
  }

  if (!permalink.startsWith("/")) {
    permalink = "/" + permalink;
  }

  if (config.defaultLocale)
    if (permalink.startsWith(`/${config.defaultLocale}`)) {
      permalink = permalink.split(config.defaultLocale)[1];
    }

  // console.log({ permalink, locales });

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
    locales,
    locale,
    type: "content",
  } as RouteInfo;
};

const getPrefix = (segment: RouteInfo, extension: string) => {
  const ending = `${segment.locale}.${extension}`;
  if (segment.file.endsWith(ending)) {
    // example/src/content/foo/[bar]/'
    return segment.file.replace(ending, "");
  }
};

const getLocalePermalinks = (array: RouteInfo[], extension: string) => {
  let cache: {
    [key: string]: {
      [locale: string]: string;
    };
  } = {};

  // first run
  array.map((segment: RouteInfo) => {
    const prefix = getPrefix(segment, extension);
    if (prefix) {
      if (!cache[prefix]) cache[prefix] = {};

      segment.locales.map((l) => {
        if (!cache[prefix][l]) {
          // 'en-US': '/cats/oscar/',
          cache[prefix][l] = segment.locale === l ? segment.permalink : "";
        }
      });
    }
  });

  //second run
  return array.map((segment: RouteInfo) => {
    const prefix = getPrefix(segment, extension);
    if (prefix && cache[prefix]) {
      segment = { ...segment, permalinks: cache[prefix] };
    }
    return segment;
  });
};

export const getContentRoutes = async (
  cwd: string,
  config: Config,
  extension = MARKDOWN
) => {
  const srcDir = `${cwd}/src/content`;
  const list = (await globby(`${srcDir}/**/*.${extension}`)).map((path) =>
    path.replace(srcDir, "")
  );
  const full = await Promise.all(
    list.map((route) => loadRoute(cwd, config, srcDir, route, extension))
  );

  const result = getLocalePermalinks(full, extension);

  return result;
};
