import AWS from 'aws-sdk';
import type { Options } from './options.js';

export const getCredentials = (options: Options) =>
  new AWS.Credentials({
    accessKeyId: options.AWS_ACCESS_KEY_ID,
    secretAccessKey: options.AWS_SECRET_ACCESS_KEY
  });
