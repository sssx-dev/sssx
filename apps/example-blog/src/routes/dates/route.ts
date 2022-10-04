import dayjs from 'dayjs';
import type { PageData, PageFnGet, PageFnProps, PagePermalink, SvelteComponentProps } from 'sssx';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type Page from './index.svelte';

export type PageProps = SvelteComponentProps<typeof Page>;

export const permalink: PagePermalink = `/:slug/`;

const COUNT = 10;

/**
 * Get all slugs for this route
 * @returns array of all slugs
 */
export const getAll: PageFnGet = async () => {
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
export const getUpdates: PageFnGet = async () => {
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
export const getRemovals: PageFnGet = async () => {
  const date = dayjs()
    .subtract(COUNT - 1, 'days') // delete last day
    .format('YYYY-MM-DD');

  return [{ slug: `route-${date}`, time: dayjs().format(`HH:mm`), title: '', description: '' }];
};

export const getProps: PageFnProps = async (data: PageData) => {
  return {
    answer: `Hello ${data.slug} on ${data.time}`
  };
};
