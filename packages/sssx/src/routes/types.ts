type Params = Record<string, any>;
export interface RouteModule {
  all: () => Params[];
  request: (params: Params) => Record<string, any>;
}

type LocalePermalink = {
  [locale: string]: string;
};

export type RouteInfo = {
  permalink: string;
  param: Record<string, any>;
  file: string;
  route: string;
  svelte?: string;
  module?: RouteModule;
  locales: string[];
  locale: string;
  permalinks?: LocalePermalink;
  type: "plain" | "content" | "filesystem";
};
