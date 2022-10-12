/**
 * Data, the result of `data` function inside `route.ts`
 */
export type Data = {
  [key: string]: unknown;
};

/**
 * General slim type that contains minimal information to start page rendering process
 */
export type Request = {
  slug: string;
  [key: string]: unknown;
};

export type PageRequests = (...args: never[]) => Promise<Request[]>;
export type PagePermalink = string | ((request: Request) => string);
export type PageData = <T extends Record<string, unknown>>(request: Request) => T | Promise<T>;

export interface DataModule {
  all: PageRequests;
  updates: PageRequests;
  removals: PageRequests;
  permalink: PagePermalink;
  data: PageData;
}

export interface Route {
  request: Request;
  /** path of the page being generates. @example `/foo/bar/2022` */
  path: string;
  template: string;
  routeName: string;
  dynamic?: string;
}

export type GetDataType<T extends (...args: any[]) => any> = Awaited<ReturnType<T>>;
