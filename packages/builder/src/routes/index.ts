import { Config } from "../utils/config";
import { getFileSystemRoutes } from "./getFileSystemRoutes";
import { getPlainRoutes } from "./getPlainRoutes";
import { getContentRoutes } from "./getContentRoutes";

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
