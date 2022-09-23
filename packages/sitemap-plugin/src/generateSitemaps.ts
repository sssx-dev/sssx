import { Progress } from 'sssx';
import type { Config } from '@sssx/config';
import type { Builder } from 'sssx';

import { generateRouteSitemaps } from './generateRouteSitemaps.js';
import { writeSitemapsIndex } from './writeSitemapsIndex.js';
import { requestsToMap } from './requestsToMap.js';
import type { Options } from './options.js';

export const generateSitemaps = async (config: Config, builder: Builder, options: Options) => {
  //   console.log(`Generating sitemaps for ${config.origin}`);

  const requests = builder.getRequests();
  const map = requestsToMap(requests, config);

  const routes = Object.keys(map);
  const bar = Progress.createBar('Sitemaps', routes.length, 0, '{route}', { route: '' });
  let sitemaps: string[] = [];

  routes.map((routeName, index) => {
    const paths = map[routeName];
    const newSitemaps = generateRouteSitemaps(routeName, paths, options, config);
    sitemaps = sitemaps.concat(newSitemaps);
    const route = newSitemaps.pop();
    bar.update(index, { route });
  });

  const indexFilename = `${options.prefix}.xml`;
  writeSitemapsIndex(indexFilename, sitemaps, options, config);

  bar.update(routes.length, { route: indexFilename });
  bar.stop();

  const all = [indexFilename, ...sitemaps];
  return all;
};
