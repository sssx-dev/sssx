import type { Config } from '@sssx/config';
import { generateSingleRouteSitemap } from './generateSingleRouteSitemap.js';
import type { Options } from './options.js';

export const generateRouteSitemaps = (
  routeName: string,
  paths: string[],
  options: Options,
  config: Config
) => {
  let i = 0;
  const filenames: string[] = [];

  while (paths.length !== 0) {
    const filename = `${options.prefix}-${routeName.toLowerCase()}-${i++}.xml`;
    const batch = paths.splice(0, Math.min(options.limit, paths.length)); // get 5000 urls or whatever is left
    generateSingleRouteSitemap(filename, batch, options, config);
    filenames.push(filename);
  }

  return filenames;
};
