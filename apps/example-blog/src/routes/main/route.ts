import type { PageData, PageFnGet, PageFnProps, PagePermalink, SvelteComponentProps } from 'sssx';
import { getRoutes } from 'sssx';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type Page from './index.svelte';

export type PageProps = SvelteComponentProps<typeof Page>;

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
export const getAll: PageFnGet = async () => [SINGLE_PAGE];

/**
 * Slugs to update or generate
 * @returns array of slugs
 */
export const getUpdates: PageFnGet = getAll; // always update

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getProps: PageFnProps = async (data: PageData) => {
  const requests = getRoutes('dates');

  return {
    title,
    requests
  };
};
