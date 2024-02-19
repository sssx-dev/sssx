import { type Config } from "../config.ts";
import { getFileSystemRoutes } from "./getFileSystemRoutes.ts";
import { getPlainRoutes } from "./getPlainRoutes.ts";
import { getContentRoutes } from "./getContentRoutes.ts";
import { type RouteInfo } from "./types.ts";

export type { RouteInfo } from "./types.ts";

// TODO: design a better architecture that would allow for streaming millions of pages

export const getAllRoutes = async (cwd: string, config: Config) => {
  const srcDir = `${cwd}/src/pages`;
  const [all, plain, content] = await Promise.all([
    getFileSystemRoutes(srcDir, config),
    getPlainRoutes(srcDir, config),
    getContentRoutes(cwd, config),
  ]);
  const array = [...all, ...plain, ...content];

  return array;
};

// TODO: turn this into a proper matching logic
// https://kit.svelte.dev/docs/advanced-routing
export const routeToFileSystem = async (
  cwd: string,
  route: string,
  routes: RouteInfo[]
): Promise<RouteInfo | undefined> => {
  const filtered = routes.filter((segment) => segment.permalink === route);

  // return first found mathcing permalink
  if (filtered.length > 0) {
    return filtered[0];
  }

  return undefined;
};
