import { globby } from "globby";
import { resolveImages } from "../plugins/resolveImages";
import { getRoute } from "../utils/getRoute";
import { rimraf } from "../utils/rimraf";
import { getCommonBuildOptions } from "../utils/settings";
import { generateClient } from "./generateClient";
import { generateSSR } from "./generateSSR";
import { renderSSR } from "./renderSSR";

type RouteInfo = {
  permalink: string;
  param: Record<string, any>;
  file: string;
};

const getAllRoutes = async (srcDir: string) => {
  const indexFiles = await globby(`${srcDir}/**/+page.ts`);
  const indexes = await Promise.all(
    indexFiles.map(async (file) => await import(file))
  );

  const all: RouteInfo[] = indexes
    .map((module, index) => {
      const { permalink } = module;
      return module.all().map((param: any) => {
        let singlePermalink = "";

        // if permalink is a fuction, then just call it
        if (typeof permalink == "function") {
          singlePermalink = permalink(param);
        } else {
          // if it's a string literal, then we need to replace each parameter there
          // TODO: add safety checks here, like a missing key somewhere
          // TODO: do not allow semicolons for production
          singlePermalink = permalink;
          Object.keys(param).map((key) => {
            singlePermalink = singlePermalink.replace(`:${key}`, param[key]);
          });
        }

        return {
          permalink: singlePermalink,
          param,
          file: indexFiles[index],
        };
      });
    })
    .flat();

  return all;
};

// TODO: turn this into a proper matching logic
// https://kit.svelte.dev/docs/advanced-routing
// pull +page.ts files
const routeToFileSystem = async (srcDir: string) => {
  const all = await getAllRoutes(srcDir);
  const list = (await globby(`${srcDir}/**/+page.svelte`)).map((path) =>
    path.replace(srcDir, "")
  );

  const array = list.map((origin) => {
    const path = origin
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
      origin,
      path,
      route,
    };
  });

  console.log(
    "////////////////////////////////////////// routeToFileSystem start"
  );
  console.log(all);
  console.log("//////////////////////////////////////////");
  array.map((line) => console.log(line));
  console.log(
    "////////////////////////////////////////// routeToFileSystem end"
  );
};

export const buildRoute = async (
  url: string,
  outdir: string,
  base: string,
  props: Record<string, any> = {}
) => {
  const route = getRoute(url);
  const ssrFile = `${outdir}/ssr.js`;

  await routeToFileSystem(`${base}pages/`);

  console.log({ route });

  // creating this inside outdir
  if (route !== "/") outdir += route;

  rimraf(outdir);

  const common = getCommonBuildOptions();
  await generateSSR(base, route, ssrFile, common, [
    resolveImages(outdir, true),
  ]);
  await renderSSR(ssrFile, outdir, props);
  await generateClient(
    base,
    route,
    outdir,
    common,
    {},
    [resolveImages(outdir)],
    props
  );
};
