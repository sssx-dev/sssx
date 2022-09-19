import path from 'path';
import AWS from 'aws-sdk';
import glob from 'tiny-glob';
import colors from 'ansi-colors';
import { Progress } from 'sssx';

import type { Builder, Plugin, Config } from 'sssx';

import { defaultOptions, type Options } from './options.js';
import { uploadToS3 } from './uploadToS3.js';
import { updateCloudFront } from './updateCloudFront.js';
import { getCredentials } from './getCredentials.js';

const updateS3 = async (options: Options, outDir: string, paths: string[], removals: string[]) => {
  console.log(options);
  const credentials = getCredentials(options);

  const Bucket = options.S3_BUCKET;

  const s3 = new AWS.S3({
    credentials,
    signatureVersion: 'v4'
  });

  const bar = Progress.createBar('s3', paths.length, 0, '| S3 | {percentage}%', { route: '' });

  // uploading everything to S3
  for (let i = 0; i < paths.length; i++) {
    const route = paths[i];
    await uploadToS3(s3, route, Bucket, outDir);
    bar.update(i + 1, { route });
  }

  //remove retired routes from S3
  for (let i = 0; i < removals.length; i++) {
    const route = removals[i];
    // TBD: add S3 removal function
    bar.update(i + 1, { route });
  }

  bar.update(paths.length, { route: 'done' });
  bar.stop();
};

const getAllFiles = async (base: string) => (await glob(`${base}/**/*.*`)).sort();
const filterPaths = (paths: string[], filter: (s: string) => boolean) => paths.filter(filter);

const plugin = (_options: Partial<Options>) => {
  const options: Options = Object.assign({}, defaultOptions, _options);

  const awsS3CloudfrontAdapter: Plugin = async (config: Config, builder: Builder) => {
    const addedRequests = builder
      .getRequests('added')
      .map(({ path }) => path.replace(process.cwd(), '').slice(1));
    const removedRequests = builder
      .getRequests('removed')
      .map(({ path }) => path.replace(process.cwd(), '').slice(1));

    const base = path.resolve(process.cwd(), config.outDir);
    const all = await getAllFiles(base);
    const prefix = `${config.outDir}/${config.appDir}`;

    const paths = !builder.isIncremental
      ? all
      : filterPaths(all, (s) => {
          let flag = false;
          flag = s.startsWith(prefix) || s.endsWith(`.xml`) || s.endsWith(`.txt`);
          if (flag) return flag;
          addedRequests.map((path) => {
            if (s.startsWith(path)) flag = true;
          });
          return flag;
        });

    // console.log(`\n`);
    // console.log(`=========ALL========`);
    // all.map((path) => console.log(path));
    // console.log(`=========PATHS========`);
    // paths.map((path) => console.log(path));
    // console.log(`=========addedRequests========`);
    // addedRequests.map((path) => console.log(path));
    // console.log(`=========removedRequests========`);
    // removedRequests.map((path) => console.log(path));
    // return;

    await updateS3(options, config.outDir, paths, removedRequests);
    await updateCloudFront(options, [...paths, ...removedRequests].sort(), config);
  };

  return awsS3CloudfrontAdapter;
};

export default plugin;
