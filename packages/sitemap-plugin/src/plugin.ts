import type { Config, Plugin, Builder } from 'sssx';
import { defaultOptions, type Options } from './options.js';
import { clean } from './clean.js';
import { generateRouteSitemaps } from './generateRouteSitemaps.js';
import { writeSitemapsIndex } from './writeSitemapsIndex.js';
import { robots } from './robots.js';
import { requestsToMap } from './requestsToMap.js';
import { updateSitemaps } from './update.js';

const generateSitemaps = async (config: Config, builder: Builder, options: Options) => {
  console.log(`Generating sitemaps for ${config.origin}`);

  // TODO: regenerate using the update URLs
  const requests = builder.getRequests();
  const map = requestsToMap(requests, config);

  // console.log(map);

  const routes = Object.keys(map);
  let sitemaps: string[] = [];

  routes.map((routeName) => {
    const paths = map[routeName];
    sitemaps = sitemaps.concat(generateRouteSitemaps(routeName, paths, options, config));
  });

  const indexFilename = `${options.prefix}.xml`;
  writeSitemapsIndex(indexFilename, sitemaps, options, config);

  const all = [indexFilename, ...sitemaps];
  all.map((sitemap) => console.log(`* Generated ${sitemap.split(`/`).pop()}`));

  return all;
};

////////////////////////////////////////////////////////////////////////

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
