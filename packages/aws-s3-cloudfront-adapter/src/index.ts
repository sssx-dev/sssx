
import AWS from 'aws-sdk'
import type { Builder, Plugin, Config } from 'sssx';
import * as dotenv from 'dotenv'
import path from 'path'
import glob from 'tiny-glob'
import fs from 'fs';
import stream from 'stream'
import cliProgress from 'cli-progress'
import colors from 'ansi-colors'

dotenv.config({
    path: path.resolve(process.cwd(), `.env.local`)
})

const PLUGIN_NAME = `@sssx/aws-s3-cloudfront-adapter`

type Options = {
    AWS_CLOUDFRONT_DISTRIBUTION_ID?:string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    S3_BUCKET: string;
    S3_BUCKET_URL?: string;
}

const defaultOptions:Options = {
    AWS_CLOUDFRONT_DISTRIBUTION_ID: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID || '',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    S3_BUCKET: process.env.S3_BUCKET || '',
    S3_BUCKET_URL: process.env.S3_BUCKET_URL || '',
}

const delay = (miliseconds = 1000) => new Promise((yay,nay) => setTimeout(yay, miliseconds))

const uploadToS3 = async (S3:AWS.S3, localPath:string, Bucket:string, outDir:string, ACL:AWS.S3.ObjectCannedACL = 'public-read') => new Promise((resolve, reject) => {
    const Key = localPath.split(outDir).pop()?.slice(1) || ''
    const readStream = fs.createReadStream(localPath);

    const uploadStream = () => {
        const passT = new stream.PassThrough();
        const cp = {
            'Content-Type': localPath.endsWith(`.html`) ? 'text/html' : ''
        }
        return {
            writeStream: passT,
            promise: S3.upload({
                ...cp,
                Body: passT,
                Bucket,
                ACL,
                Key,
                ContentDisposition: 'inline'
            }).promise(),
        };
    }

    const { writeStream, promise } = uploadStream();
    readStream.pipe(writeStream)

    promise.then(resolve).catch(reject)
})

const plugin = (_options:Partial<Options>) => {
    const options:Options = Object.assign({}, defaultOptions, _options)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const log = (...args:any[]) => console.log(`${PLUGIN_NAME}:`, ...args)

    const credentials = new AWS.Credentials({
        accessKeyId: options.AWS_ACCESS_KEY_ID,
        secretAccessKey: options.AWS_SECRET_ACCESS_KEY,
    })

    const Bucket = options.S3_BUCKET
    
    const s3 = new AWS.S3({
        credentials,
        signatureVersion: 'v4'
    })

    const cloudfront = options.AWS_CLOUDFRONT_DISTRIBUTION_ID
        ? new AWS.CloudFront({credentials})
        : undefined

    const awsS3CloudfrontAdapter:Plugin = async (config:Config, builder:Builder) => {
        // log(`Inside ${PLUGIN_NAME}`, options)
        // log(config)
        
        // const currentPaths = builder.getPaths()
        // currentPaths.map(({path}) => log(path))

        const base = path.resolve(process.cwd(), config.outDir)
        
        const paths = await glob(`${base}/**/*.*`)

        const multibar = new cliProgress.MultiBar({
            clearOnComplete: false,
            hideCursor: true
        
        }, cliProgress.Presets.shades_grey);

        const barS3 = multibar.create(paths.length, 0, {}, {
            format: colors.cyan('{bar}') + '| S3 | {percentage}% | {value}/{total} | {route}'
        });
        const MAX_CLOUDFRONT_SECONDS = 100
        const barCloudfront = multibar.create(MAX_CLOUDFRONT_SECONDS, 0, {status: 'waiting'}, {
            format: colors.yellow('{bar}') + '| CloudFront | {seconds} | {status}',
        });
        
        // uploading everything
        for(let i=0;i<paths.length;i++){
            const localPath = paths[i]
            const route = localPath.split(config.outDir).pop() || ''
            await uploadToS3(s3, localPath, Bucket, config.outDir)
            // console.log(i, localPath)
            barS3.update(i+1, {route})
        }

        barS3.update(barS3.getTotal(), {route: 'done'})
        barS3.stop()
        
        // https://github.com/aws/aws-sdk-js/issues/3983#issuecomment-990786567
        if(
            cloudfront
            && options.AWS_CLOUDFRONT_DISTRIBUTION_ID
        ){
            const d = new Date()
            const ar = [d.getFullYear(), d.getMonth(), d.getDate(), Math.random()]
            const CallerReference = ar.join(`-`)

            const DistributionId = options.AWS_CLOUDFRONT_DISTRIBUTION_ID
            const request:AWS.CloudFront.Types.CreateInvalidationRequest = {
                DistributionId,
                InvalidationBatch: {
                    Paths: {
                        Quantity: paths.length,
                        Items: paths
                        .map(a => a.split(config.outDir).pop() || '')
                        .filter(a => a.length > 0)
                    },
                    CallerReference
                }
            }

            // console.log(request)

            const res = await cloudfront.createInvalidation(request).promise()
            // console.log(res)

            const Id = res.Invalidation?.Id
            let status = res.Invalidation?.Status

            let cfCounter = 0;
            while(Id && status === 'InProgress'){
                const s = await cloudfront.getInvalidation({DistributionId, Id}).promise()
                // console.log(s)
                status = s.Invalidation?.Status
                await delay()

                barCloudfront.update(cfCounter++, { status, seconds: `${cfCounter} seconds` })
            }

            barCloudfront.update(MAX_CLOUDFRONT_SECONDS)
            barCloudfront.stop()
        }
    }

    return awsS3CloudfrontAdapter
}

export default plugin;