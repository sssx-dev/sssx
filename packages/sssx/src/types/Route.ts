export type Data = {
  slug: string;
  [key: string]: unknown;
};

export type Request = {
  path: string;
  template: string;
  routeName: string;
  dynamic?: string;
};

export type PageFnGet = (...args: never[]) => Promise<Data[]>;
export type PagePermalink = string | ((data: Data) => string);

export interface PageModule {
  getAll: PageFnGet;
  getUpdates: PageFnGet;
  getRemovals: PageFnGet;
  permalink: PagePermalink;
  getProps: (data: Data) => never;
}
