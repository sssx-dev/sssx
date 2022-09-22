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

const SINGLE_PAGE = {
  slug: '',
  title,
  description: `Description for ${title}`
};

/**
 * Get all slugs for this route
 * @returns array of all slugs
 */
export const getAll: RouteAllFn = async () => [SINGLE_PAGE];

/**
 * Slugs to update or generate
 * @returns array of slugs
 */
export const getUpdates: RouteAllFn = getAll; // always update

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getProps: RoutePropsFn<Request, PageProps> = async (request) => {
  const testBlogSlug = Routes['blog']({ slug: `hello` });
  const requests = getRoutes('dates');
  const links = requests.map((r) => Routes['dates'](r));

  return {
    title,
    testBlogSlug,
    requests,
    links
  };
};
