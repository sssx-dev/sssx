import type {
  UnwrapRouteAll,
  RoutePropsFn,
  RoutePermalinkFn,
  SvelteComponentProps,
  RouteAllFn
} from 'sssx';
import type Page from './index.svelte';
import { hello } from '../../bar.js';

export type PageProps = SvelteComponentProps<typeof Page>;
export type Request = UnwrapRouteAll<typeof getAll>;

export const permalink: RoutePermalinkFn<Request> = `/blog/:slug/`;

export const getAll: RouteAllFn = async () => {
  return [{ slug: `hello`, bar: hello() }, { slug: `world` }].map((a, index) => ({
    ...a,
    title: `Title ${index}`,
    description: `Description ${index}`
  }));
};

export const getProps: RoutePropsFn<Request, PageProps> = async (request) => {
  const { title, description } = request;
  return {
    title,
    description
  };
};
