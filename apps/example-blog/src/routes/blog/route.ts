import type { PageRequests, Request, PagePermalink } from 'sssx';
import { hello } from '../../bar.js';

export const permalink: PagePermalink = `/blog/:slug/`;

export const all: PageRequests = async () => {
  return [{ slug: `hello`, bar: hello() }, { slug: `world` }];
};

export const data = async (request: Request) => {
  return {
    ...request,
    title: `Title ${Math.random()}`,
    description: `Description ${Math.random()}`
  };
};
