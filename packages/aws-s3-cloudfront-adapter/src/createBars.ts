import colors from 'ansi-colors';
import cliProgress from 'cli-progress';
import { MAX_CLOUDFRONT_SECONDS } from './constats.js';

export const createBars = (s3Length: number, cloudfrontLength = MAX_CLOUDFRONT_SECONDS) => {
  const multibar = new cliProgress.MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true
    },
    cliProgress.Presets.shades_grey
  );

  const barS3 = multibar.create(
    s3Length,
    0,
    {},
    {
      format: colors.cyan('{bar}') + '| S3 | {percentage}% | {value}/{total} | {route}'
    }
  );

  const barCloudfront = multibar.create(
    cloudfrontLength,
    0,
    { status: 'waiting', seconds: '-' },
    {
      format: colors.yellow('{bar}') + '| CloudFront | {seconds} | {status}'
    }
  );

  return {
    multibar,
    s3: {
      bar: barS3
    },
    cloudfront: {
      bar: barCloudfront,
      length: cloudfrontLength
    }
  };
};
