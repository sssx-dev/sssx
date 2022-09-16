import dayjs from 'dayjs';
import type { UnwrapRouteAll, RoutePropsFn, RoutePermalinkFn, SvelteComponentProps } from 'sssx';
// @ts-ignore
import type Page from './index.svelte';

export type PageProps = SvelteComponentProps<typeof Page>;
export type Request = UnwrapRouteAll<typeof getAll>;

export const permalink: RoutePermalinkFn<Request> = `/:slug/`;

/**
 * Get all slugs for this route
 * @returns array of all slugs
 */
export const getAll = async () => {
  return Array.from(Array(4).keys()).map((index) => {
    const date = dayjs().subtract(index, 'days').format('YYYY-MM-DD');
    return { slug: `route-${date}`, time: `00:00` };
  });
};

/**
 * Slugs to update or generate
 * @returns array of slugs
 */
export const getUpdates = async () => {
  const date = dayjs().format('YYYY-MM-DD');
  return [{ slug: `route-${date}`, time: dayjs().format(`HH:mm`) }];
};

/**
 * Slugs to remove
 * @returns array of slus
 */
export const getRemovals = async () => {
  const date = dayjs().subtract(3, 'days').format('YYYY-MM-DD');

  return [{ slug: `route-${date}`, time: dayjs().format(`HH:mm`) }];
};

export const getProps: RoutePropsFn<Request, PageProps> = async (request) => {
  return {
    answer: `Hello ${request.slug} on ${request.time}`
  };
};
