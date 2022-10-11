import dayjs from 'dayjs';
import type { PageRequests, Request, PagePermalink } from 'sssx';

export const permalink: PagePermalink = `/:slug/`;

const COUNT = 10;

/**
 * Get all slugs for this route
 * @returns array of all slugs
 */
export const all: PageRequests = async () => {
  return Array.from(Array(COUNT).keys()).map((index) => {
    const date = dayjs().subtract(index, 'days').format('YYYY-MM-DD');
    return {
      slug: `route-${date}`,
      time: `00:00`,
      title: `Hello there for ${date}`,
      description: `Description on ${date}`
    };
  });
};

/**
 * Slugs to update or generate
 * @returns array of slugs
 */
export const updates: PageRequests = async () => {
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
export const removals: PageRequests = async () => {
  const date = dayjs()
    .subtract(COUNT - 1, 'days') // delete last day
    .format('YYYY-MM-DD');

  return [{ slug: `route-${date}`, time: dayjs().format(`HH:mm`), title: '', description: '' }];
};

export const data = async (request: Request) => {
  return {
    answer: `Hello ${request.slug} on ${request.time}`
  };
};
