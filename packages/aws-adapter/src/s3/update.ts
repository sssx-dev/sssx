import AWS from 'aws-sdk';
import { Progress } from 'sssx';
import { getCredentials } from '../getCredentials.js';
import { upload } from '../s3/upload.js';
import { remove } from '../s3/remove.js';
import type { Options } from '../options.js';

export const update = async (
  options: Options,
  outDir: string,
  paths: string[],
  removals: string[]
) => {
  const credentials = getCredentials(options);

  // console.log('updateS3', removals);

  const Bucket = options.S3_BUCKET;

  const s3 = new AWS.S3({
    credentials,
    signatureVersion: 'v4'
  });

  const bar = Progress.createBar('S3', paths.length, 0, '{percentage}%', { route: '' });

  // uploading everything to S3
  for (let i = 0; i < paths.length; i++) {
    const route = paths[i];
    await upload(s3, route, Bucket, outDir);
    bar.update(i + 1, { route });
  }

  //remove retired routes from S3
  for (let i = 0; i < removals.length; i++) {
    const route = removals[i];
    await remove({ s3, Bucket, Prefix: route });
    bar.update(i + 1, { route });
  }

  bar.update(paths.length, { route: 'done' });
  bar.stop();
};
