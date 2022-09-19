type Options = {
  s3: AWS.S3;
  Prefix: string;
  Bucket: string;
};

export const remove = async (options: Options) => {
  const { s3, Bucket, Prefix } = options;
  const listParams = {
    Bucket,
    Prefix
  };

  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (listedObjects.Contents?.length === 0) return;

  const deleteParams = {
    Bucket,
    Delete: { Objects: [] }
  };

  listedObjects.Contents?.forEach(({ Key }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    deleteParams.Delete.Objects.push({ Key });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await remove(options);
};
