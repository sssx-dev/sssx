import type { PageRequests, Request, PagePermalink } from 'sssx';
import { getAllMarkdown } from '@sssx/markdown';

export const permalink: PagePermalink = `/:slug/`;

const requests = await getAllMarkdown('assets/posts/**/*.md');

export const all: PageRequests = async () => {
  return requests;
};

export const data = async (request: Request) => {
  return request;
};
