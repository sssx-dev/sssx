import type { UnwrapRouteAll, RoutePropsFn, RoutePermalinkFn, SvelteComponentProps } from 'sssx';
// @ts-ignore
import type Page from './index.svelte';
import { Routes } from '../index.js';

export type PageProps = SvelteComponentProps<typeof Page>;
export type Request = UnwrapRouteAll<typeof getAll>;

export const permalink: RoutePermalinkFn<Request> = `/`;

/**
 * Get all slugs for this route
 * @returns array of all slugs
 */
export const getAll = async () => [{}];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getProps: RoutePropsFn<Request, PageProps> = async (request) => {
  // breaks
  // const testBlogSlug = Routes['blog']({slug:`123`}) // can't be generated in the root scope

  // works
  const testBlogSlug = Routes['blog']({ slug: `hello` }); // can't be generated in the root scope

  return {
    title: `Example SSSX Blog`,
    testBlogSlug
  };
};
