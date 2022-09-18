import path from 'path';
import AWS from 'aws-sdk';
import glob from 'tiny-glob';
import * as dotenv from 'dotenv';
import colors from 'ansi-colors';
import { Progress } from 'sssx';

import type { Builder, Plugin, Config } from 'sssx';

import { defaultOptions, type Options } from './options.js';
import { uploadToS3 } from './uploadToS3.js';
import { updateCloudFront } from './updateCloudFront.js';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.local`)
});

const plugin = (_options: Partial<Options>) => {
  const options: Options = Object.assign({}, defaultOptions, _options);

  const credentials = new AWS.Credentials({
    accessKeyId: options.AWS_ACCESS_KEY_ID,
    secretAccessKey: options.AWS_SECRET_ACCESS_KEY
  });

  const Bucket = options.S3_BUCKET;

  const s3 = new AWS.S3({
    credentials,
    signatureVersion: 'v4'
  });

  const awsS3CloudfrontAdapter: Plugin = async (config: Config, builder: Builder) => {
    const addedRequests = builder.getRequests('added');
    const removedRequests = builder.getRequests('removed');

    const base = path.resolve(process.cwd(), config.outDir);
    const paths = (
      await Promise.all([
        glob(`${base}/${config.appDir}/**/*.*`),
        glob(`${base}/**/*.xml`), // reupload xml files
        glob(`${base}/**/*.txt`) // reupload txt files
      ])
    )
      .flat()
      .sort();

    console.log(`\n`);
    console.log(`=========PATHS========`);
    paths.map((path) => console.log(path));
    console.log(`=========addedRequests========`);
    addedRequests.map(({ path }) => console.log(path));
    console.log(`=========removedRequests========`);
    removedRequests.map(({ path }) => console.log(path));

    return;
    const bar = Progress.createBar(
      's3',
      paths.length,
      0,
      { route: '' },
      { format: colors.blue('{bar}') + '| S3 | {percentage}%' }
    );

    // uploading everything to S3
    for (let i = 0; i < paths.length; i++) {
      const localPath = paths[i];
      const route = localPath.split(config.outDir).pop() || '';
      await uploadToS3(s3, localPath, Bucket, config.outDir);
      bar.update(i + 1, { route });
    }

    bar.update(paths.length, { route: 'done' });
    bar.stop();

    await updateCloudFront(credentials, options, paths, config);
  };

  return awsS3CloudfrontAdapter;
};

export default plugin;
