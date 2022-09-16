import glob from 'tiny-glob';
import path from 'path';
import type { Builder, Config } from 'sssx';
import type { Options } from './options.js';
import { requestsToMap } from './requestsToMap.js';
import { XML } from './xml.js';
import dayjs from 'dayjs';

export const updateSitemaps = async (config: Config, builder: Builder, options: Options) => {
  const addedMap = requestsToMap(builder.getRequests('added'), config);
  const removedMap = requestsToMap(builder.getRequests('removed'), config);

  const routes = [...Object.keys(addedMap), ...Object.keys(removedMap)]
    .filter((value, index, array) => array.indexOf(value) === index) // remove duplicates
    .sort();

  //   console.log(`addedMap`);
  //   console.log(addedMap);
  //   console.log(`removedMap`);
  //   console.log(removedMap);
  //   console.log(`routes`);
  //   console.log(routes);

  await Promise.all(
    routes.map((route) => {
      const addedPaths = addedMap[route];
      const removedPaths = removedMap[route];
      return updateRoute(route, addedPaths, removedPaths, config, options);
    })
  );
};

/**
 * For each route, go over existing XML sitemap files and update them by adding new paths, and removing old ones.
 * If updated xml file has more than 5000 items, new URLs will be pushed to new xml file.
 * @param route
 * @param addedPaths
 * @param removedPaths
 * @param config
 * @param options
 */
const updateRoute = async (
  route: string,
  addedPaths: string[],
  removedPaths: string[],
  config: Config,
  options: Options
) => {
  const xmlRegex = path.resolve(process.cwd(), config.outDir, options.prefix) + `-${route}-*.xml`;
  const xmlFiles = await glob(xmlRegex);
  //   console.log('updateRoute', { route, addedPaths, removedPaths });
  //   console.log({ xmlRegex });
  //   console.log({ xmlFiles });

  const lastXMLFile = xmlFiles[xmlFiles.length - 1];

  const lastmod = dayjs().format('YYYY-MM-DD');
  const changefreq = 'monthly';
  const priority = 0.7;

  // remove paths from all XML files
  xmlFiles.map((file) => {
    const builder = new XML(file);
    removedPaths.map((path) => builder.remove(path)); // TODO: this is O(m*n), simplify it by searching for a string first via sed or regex
    builder.save({ dry: false });
  });

  // try to add it inside the last file
  const builder = new XML(lastXMLFile);

  addedPaths.map((loc) =>
    builder.add({
      loc,
      lastmod,
      changefreq,
      priority
    })
  );

  const shouldCreateNewXMLFile = builder.count > options.limit;

  if (shouldCreateNewXMLFile) {
    // create new file if it's over the limit
    const newPath = xmlFiles[0].replace(`0`, `${xmlFiles.length}`);
    const builder = new XML(newPath);

    addedPaths.map((loc) =>
      builder.add({
        loc,
        lastmod,
        changefreq,
        priority
      })
    );

    builder.save({ dry: false });
  } else {
    // if it's under limit of 5000 urls, then save
    builder.save({ dry: false });
  }
};
