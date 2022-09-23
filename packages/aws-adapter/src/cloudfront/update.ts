import AWS from 'aws-sdk';
import { Progress } from 'sssx';
import { delay } from '../delay.js';
import { getCredentials } from '../getCredentials.js';

import type { Config } from '@sssx/config';
import type { Options } from '../options.js';

const TIMEOUT = 100;

export const update = async (options: Options, paths: string[], config: Config) => {
  const credentials = getCredentials(options);
  const cloudfront = options.AWS_CLOUDFRONT_DISTRIBUTION_ID
    ? new AWS.CloudFront({ credentials })
    : undefined;

  // https://github.com/aws/aws-sdk-js/issues/3983#issuecomment-990786567
  if (cloudfront && options.AWS_CLOUDFRONT_DISTRIBUTION_ID) {
    const bar = Progress.createBar('CloudFront', TIMEOUT, 0);

    const d = new Date();
    const ar = [d.getFullYear(), d.getMonth(), d.getDate(), Math.random()];
    const CallerReference = ar.join(`-`);

    const Items = paths.map((a) => a.split(config.outDir).pop() || '').filter((a) => a.length > 0);

    const DistributionId = options.AWS_CLOUDFRONT_DISTRIBUTION_ID;
    const request: AWS.CloudFront.Types.CreateInvalidationRequest = {
      DistributionId,
      InvalidationBatch: {
        Paths: {
          Quantity: paths.length,
          Items
        },
        CallerReference
      }
    };

    // console.log(request)

    const res = await cloudfront.createInvalidation(request).promise();
    // console.log(res)

    const Id = res.Invalidation?.Id;
    let status = res.Invalidation?.Status;

    let cfCounter = 0;
    while (Id && status === 'InProgress') {
      const s = await cloudfront.getInvalidation({ DistributionId, Id }).promise();
      // console.log(s)
      status = s.Invalidation?.Status;
      await delay();

      bar.update(cfCounter++, { status, seconds: `${cfCounter} seconds` });
    }

    bar.update(TIMEOUT);
    bar.stop();
  }
};
