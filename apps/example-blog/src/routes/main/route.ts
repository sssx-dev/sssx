import type {
  UnwrapRouteAll,
  RouteAllFn,
  RoutePropsFn,
  RoutePermalinkFn,
  SvelteComponentProps
} from 'sssx';
import type Page from './index.svelte';
import { Routes } from '../index.js';
import { getRoutes } from 'sssx';

export type PageProps = SvelteComponentProps<typeof Page>;
export type Request = UnwrapRouteAll<typeof getAll>;

export const permalink: RoutePermalinkFn<Request> = `/`;

const title = `Example SSSX Blog`;

/**
 * Get all slugs for this route
 * @returns array of all slugs
 */
export const getAll: RouteAllFn = async () => [
  {
    slug: '',
    title,
    description: `Description for ${title}`
  }
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getProps: RoutePropsFn<Request, PageProps> = async (request) => {
  // breaks
  // const testBlogSlug = Routes['blog']({slug:`123`}) // can't be generated in the root scope

  // works
  const testBlogSlug = Routes['blog']({ slug: `hello` }); // can't be generated in the root scope
  const requests = getRoutes('dates');
  const links = requests.map((r) => Routes['dates'](r));

  return {
    title,
    testBlogSlug,
    requests,
    links
  };
};
