import fs from 'fs';
import stream from 'stream';
import { getContentType } from '../getContentType.js';

const uploadStream = (S3: AWS.S3, Key: string, request: AWS.S3.Types.PutObjectRequest) => {
  const passT = new stream.PassThrough();
  return {
    writeStream: passT,
    promise: S3.upload({
      ...request,
      Key,
      Body: passT
    }).promise()
  };
};

export const upload = async (
  S3: AWS.S3,
  localPath: string,
  Bucket: string,
  outDir: string,
  ACL: AWS.S3.ObjectCannedACL = 'public-read'
) =>
  new Promise((resolve, reject) => {
    let Key = localPath.split(outDir).pop()?.slice(1) || '';
    const readStream = fs.createReadStream(localPath);
    const ext = localPath.split(`.`).slice(-1)[0].toLowerCase();

    const partial: AWS.S3.Types.PutObjectRequest = {
      Bucket,
      ACL,
      Key,
      ContentType: getContentType(ext),
      ContentDisposition: 'inline'
    };

    // instead of uploading /<folder>/index.html
    // we will upload root files `/` placed in `/<folder>` with the content of `index.html`
    if (Key !== 'index.html' && Key.endsWith(`index.html`)) {
      Key = Key.split(`/`).slice(0, -1).join(`/`) + '/';
    }

    const { writeStream, promise } = uploadStream(S3, Key, partial);
    readStream.pipe(writeStream);

    promise.then(resolve).catch(reject);
  });
