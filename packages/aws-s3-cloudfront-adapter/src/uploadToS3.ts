import fs from 'fs';
import stream from 'stream';
import { getContentType } from './getContentType.js';

export const uploadToS3 = async (
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

    const uploadStream = () => {
      const passT = new stream.PassThrough();
      return {
        writeStream: passT,
        promise: S3.upload({
          ...partial,
          Key,
          Body: passT
        }).promise()
      };
    };

    const { writeStream, promise } = uploadStream();
    readStream.pipe(writeStream);

    promise.then(resolve).catch(reject);
  });
