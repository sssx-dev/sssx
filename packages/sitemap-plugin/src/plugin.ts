import type { Config, Plugin, Builder } from 'sssx';
import { defaultOptions, type Options } from './options.js';
import { clean } from './clean.js';

import { robots } from './robots.js';
import { updateSitemaps } from './update.js';
import { generateSitemaps } from './generateSitemaps.js';

export const plugin = (inputOptions: Partial<Options> = defaultOptions) => {
  const options = Object.assign({}, inputOptions, defaultOptions);

  const sitemapPlugin: Plugin = async (config: Config, builder: Builder) => {
    if (builder.isIncremental) {
      await updateSitemaps(config, builder, options);
    } else {
      if (options.forceClean) {
        clean(options, config);
      }

      const all = await generateSitemaps(config, builder, options);

      if (options.generateRobots) {
        robots(options, config, all);
      }
    }
  };

  return sitemapPlugin;
};
