import dayjs from 'dayjs';
import type {
  UnwrapRouteAll,
  RouteAllFn,
  RoutePropsFn,
  RoutePermalinkFn,
  SvelteComponentProps
} from 'sssx';
import type Page from './index.svelte';

export type PageProps = SvelteComponentProps<typeof Page>;
export type Request = UnwrapRouteAll<typeof getAll>;

export const permalink: RoutePermalinkFn<Request> = `/:slug/`;

const COUNT = 100;

/**
 * Get all slugs for this route
 * @returns array of all slugs
 */
export const getAll: RouteAllFn = async () => {
  return Array.from(Array(COUNT).keys()).map((index) => {
    const date = dayjs().subtract(index, 'days').format('YYYY-MM-DD');
    return {
      slug: `route-${date}`,
      time: `00:00`,
      title: `Title for ${date}`,
      description: `Description on ${date}`
    };
  });
};

/**
 * Slugs to update or generate
 * @returns array of slugs
 */
export const getUpdates: RouteAllFn = async () => {
  const date = dayjs().format('YYYY-MM-DD');
  return [
    {
      slug: `route-${date}`,
      time: dayjs().format(`HH:mm`),
      title: `Title for ${date}`,
      description: `Description on ${date}`
    }
  ];
};

/**
 * Slugs to remove
 * @returns array of slus
 */
export const getRemovals = async () => {
  const date = dayjs()
    .subtract(COUNT - 1, 'days') // delete last day
    .format('YYYY-MM-DD');

  return [{ slug: `route-${date}`, time: dayjs().format(`HH:mm`) }];
};

export const getProps: RoutePropsFn<Request, PageProps> = async (request) => {
  return {
    answer: `Hello ${request.slug} on ${request.time}`
  };
};
