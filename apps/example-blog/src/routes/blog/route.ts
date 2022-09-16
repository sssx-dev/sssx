import type { UnwrapRouteAll, RoutePropsFn, RoutePermalinkFn, SvelteComponentProps } from 'sssx';
// @ts-ignore
import type Page from './index.svelte';
import { hello } from '../../bar.js';

export type PageProps = SvelteComponentProps<typeof Page>;
export type Request = UnwrapRouteAll<typeof getAll>;

export const permalink: RoutePermalinkFn<Request> = `/blog/:slug/`;

export const getAll = async () => {
  return [{ slug: `hello`, bar: hello() }, { slug: `world` }];
};

export const getProps: RoutePropsFn<Request, PageProps> = async (request) => {
  return {
    title: `Hello ${request.slug}`
  };
};
