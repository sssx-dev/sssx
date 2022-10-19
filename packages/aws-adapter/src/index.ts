import path from 'path';
import glob from 'tiny-glob';

import type { Builder, Plugin } from 'sssx';
import type { Config } from '@sssx/config';

import { defaultOptions, type Options } from './options.js';
import { update as updateS3 } from './s3/update.js';
import { update as updateCloudFront } from './cloudfront/update.js';

const getAllFiles = async (base: string) => (await glob(`${base}/**/*.*`)).sort();
const filterPaths = (paths: string[], filter: (s: string) => boolean) => paths.filter(filter);

const plugin = (_options: Partial<Options>) => {
  const options: Options = Object.assign({}, defaultOptions, _options);

  const awsS3CloudfrontAdapter: Plugin = async (config: Config, builder: Builder) => {
    const addedRoutes = builder
      .getRoutes('added')
      .map(({ path }) => path.replace(process.cwd(), '').slice(1));
    const removedRoutes = builder
      .getRoutes('removed')
      .map(({ path }) =>
        path
          .replace(process.cwd(), '')
          .replace(config.outDir, config.basePath)
          .replaceAll(`//`, `/`)
      );

    const base = path.resolve(process.cwd(), config.outDir);
    const all = await getAllFiles(base);
    const prefix = `${config.outDir}/${config.appDir}`;

    const paths = !builder.isIncremental
      ? all
      : filterPaths(all, (s) => {
          let flag = false;
          flag = s.startsWith(prefix) || s.endsWith(`.xml`) || s.endsWith(`.txt`);
          if (flag) return flag;
          addedRoutes.map((path) => {
            if (s.startsWith(path)) flag = true;
          });
          return flag;
        });

    // console.log(`\n`);
    // console.log(`=========ALL========`);
    // all.map((path) => console.log(path));
    // console.log(`=========PATHS========`);
    // paths.map((path) => console.log(path));
    // console.log(`=========addedRoutes========`);
    // addedRoutes.map((path) => console.log(path));
    // console.log(`=========removedRequests========`);
    // removedRequests.map((path) => console.log(path));
    // return;

    await updateS3(options, config.outDir, paths, removedRoutes);
    await updateCloudFront(options, [...paths, ...removedRoutes].sort(), config);
  };

  return awsS3CloudfrontAdapter;
};

export default plugin;
