import crypto from 'crypto'

export const sha1 = (data:string) => {
    return crypto.createHash('sha1').update(data).digest('hex');
}