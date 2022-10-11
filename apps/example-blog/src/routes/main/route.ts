import type { PageRequests, Request, PagePermalink } from 'sssx';
import { getRoutes } from 'sssx';

export const permalink: PagePermalink = `/`;

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
export const all: PageRequests = async () => [SINGLE_PAGE];

/**
 * Slugs to update or generate
 * @returns array of slugs
 */
export const updates: PageRequests = all; // always update

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const data = async (request: Request) => {
  const routes = getRoutes('dates');

  return {
    title,
    routes
  };
};
