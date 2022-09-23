import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.local`)
});
/**
 * default options are loaded from your `.env` file
 */
export type Options = {
  AWS_CLOUDFRONT_DISTRIBUTION_ID?: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  S3_BUCKET: string;
  S3_BUCKET_URL?: string;
};

export const defaultOptions: Options = {
  AWS_CLOUDFRONT_DISTRIBUTION_ID: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID || '',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  S3_BUCKET: process.env.S3_BUCKET || '',
  S3_BUCKET_URL: process.env.S3_BUCKET_URL || ''
};
