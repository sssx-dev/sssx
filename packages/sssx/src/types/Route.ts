export type RouteParams = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  [key: string]: unknown;
};

export type Request = {
  item: RouteParams;
  path: string;
  template: string;
  routeName: string;
  dynamic?: string;
};

export type RouteAllFn = (...args: never[]) => Promise<RouteParams[]>;
export type RoutePropsFn<Item, PageProps> = (item: Item) => Promise<PageProps>;
export type RoutePermalinkFn<Item> = string | ((item: Item) => string);

type Unarray<T> = T extends Array<infer U> ? U : T; // Unarray<Item[]> = Item

export type UnwrapRouteAll<T extends RouteAllFn> = Unarray<Awaited<ReturnType<T>>>;

export interface PageModule<T extends RouteAllFn, PageProps> {
  getAll: T;
  getUpdates: T;
  getRemovals: T;
  permalink: RoutePermalinkFn<T>;
  getProps: RoutePropsFn<T, PageProps>;
}

/*

export type GetStaticPropsContext<
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = {
  params?: Q
  preview?: boolean
  previewData?: D
  locale?: string
  locales?: string[]
  defaultLocale?: string
}

export type GetStaticPropsResult<P> =
  | { props: P; revalidate?: number | boolean }
  | { redirect: Redirect; revalidate?: number | boolean }
  | { notFound: true; revalidate?: number | boolean }

export type GetStaticProps<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = (
  context: GetStaticPropsContext<Q, D>
) => Promise<GetStaticPropsResult<P>> | GetStaticPropsResult<P>

export type InferGetStaticPropsType<T> = T extends GetStaticProps<infer P, any>
  ? P
  : T extends (
      context?: GetStaticPropsContext<any>
    ) => Promise<GetStaticPropsResult<infer P>> | GetStaticPropsResult<infer P>
  ? P
  : never

export type GetStaticPathsContext = {
  locales?: string[]
  defaultLocale?: string
}

export type GetStaticPathsResult<P extends ParsedUrlQuery = ParsedUrlQuery> = {
  paths: Array<string | { params: P; locale?: string }>
  fallback: boolean | 'blocking'
}

export type GetStaticPaths<P extends ParsedUrlQuery = ParsedUrlQuery> = (
  context: GetStaticPathsContext
) => Promise<GetStaticPathsResult<P>> | GetStaticPathsResult<P>

export type GetServerSidePropsContext<
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = {
  req: IncomingMessage & {
    cookies: NextApiRequestCookies
  }
  res: ServerResponse
  params?: Q
  query: ParsedUrlQuery
  preview?: boolean
  previewData?: D
  resolvedUrl: string
  locale?: string
  locales?: string[]
  defaultLocale?: string
}

export type GetServerSidePropsResult<P> =
  | { props: P | Promise<P> }
  | { redirect: Redirect }
  | { notFound: true }

*/
