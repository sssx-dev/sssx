export type PageData = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  [key: string]: unknown;
};

export type PageRequest = {
  data: PageData;
  path: string;
  template: string;
  routeName: string;
  dynamic?: string;
};

export type PageFnGet = (...args: never[]) => Promise<PageData[]>;
export type PageFnProps = (data: PageData) => Promise<unknown>;
export type PagePermalink = string | ((item: unknown) => string);

export interface PageModule {
  getAll: PageFnGet;
  getUpdates: PageFnGet;
  getRemovals: PageFnGet;
  permalink: PagePermalink;
  getProps: PageFnProps;
}
