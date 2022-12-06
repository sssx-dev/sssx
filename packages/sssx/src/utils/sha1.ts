import crypto from 'crypto';

export const sha1 = (data: string, length = 5) => {
  return crypto.createHash('sha1').update(data).digest('hex').substring(0, length);
};
