import { globby } from "globby";
import { checkSlashes } from "../utils/checkSlashes.ts";
import { RouteInfo } from "./types.ts";
import { Config } from "../config.ts";
import { getDefaultLocales } from "../utils/getLocales.ts";

const PAGE_SVELTE = `+page.svelte`;

export const getPlainRoutes = async (srcDir: string, config: Config) => {
  let locales = getDefaultLocales(config);
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
        locales,
      };
    })
    .filter((segment) => {
      // filtering out /some/[slug]/route
      return segment.route.indexOf("[") === -1;
    });

  return array;
};
