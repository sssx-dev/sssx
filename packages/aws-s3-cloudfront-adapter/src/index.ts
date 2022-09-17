import path from 'path';
import AWS from 'aws-sdk';
import glob from 'tiny-glob';
import * as dotenv from 'dotenv';

import type { Builder, Plugin, Config } from 'sssx';

import { defaultOptions, type Options } from './options.js';
import { uploadToS3 } from './uploadToS3.js';
import { createBars } from './createBars.js';
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
    // currentPaths.map(({path}) => log(path))

    const base = path.resolve(process.cwd(), config.outDir);
    const paths = await glob(`${base}/**/*.*`);

    const bars = createBars(paths.length);

    // uploading everything to S3
    for (let i = 0; i < paths.length; i++) {
      const localPath = paths[i];
      const route = localPath.split(config.outDir).pop() || '';
      await uploadToS3(s3, localPath, Bucket, config.outDir);
      bars.s3.bar.update(i + 1, { route });
    }

    bars.s3.bar.update(bars.s3.bar.getTotal(), { route: 'done' });
    bars.s3.bar.stop();

    await updateCloudFront(
      credentials,
      options,
      paths,
      config,
      bars.cloudfront.bar,
      bars.cloudfront.length
    );

    bars.multibar.stop();
  };

  return awsS3CloudfrontAdapter;
};

export default plugin;
