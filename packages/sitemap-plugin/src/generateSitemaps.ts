import { Progress } from 'sssx';
import type { Config } from '@sssx/config';
import type { Builder } from 'sssx';

import { generateRouteSitemaps } from './generateRouteSitemaps.js';
import { writeSitemapsIndex } from './writeSitemapsIndex.js';
import { routeToMap } from './routeToMap.js';
import type { Options } from './options.js';

export const generateSitemaps = async (config: Config, builder: Builder, options: Options) => {
  //   console.log(`Generating sitemaps for ${config.origin}`);

  const routes = builder.getRoutes();
  const map = routeToMap(routes, config);

  const routesKeys = Object.keys(map);
  const bar = Progress.createBar('Sitemaps', routesKeys.length, 0, '{route}', { route: '' });
  let sitemaps: string[] = [];

  routesKeys.map((routeName, index) => {
    const paths = map[routeName];
    const newSitemaps = generateRouteSitemaps(routeName, paths, options, config);
    sitemaps = sitemaps.concat(newSitemaps);
    const route = newSitemaps.pop();
    bar.update(index, { route });
  });

  const indexFilename = `${options.prefix}.xml`;
  writeSitemapsIndex(indexFilename, sitemaps, options, config);

  bar.update(routesKeys.length, { route: indexFilename });
  bar.stop();

  const all = [indexFilename, ...sitemaps];
  return all;
};
