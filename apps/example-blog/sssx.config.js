import sitemapPlugin from '@sssx/sitemap-plugin'
import s3adapter from '@sssx/aws-s3-cloudfront-adapter'

const origin = `https://sssx.github.io`

/** @type {import('sssx').Config} */
const config = {
    origin,
    distDir: `.sssx`,
    outDir: `dist`,
    appDir: '__SSSX__',
    basePath: '',
    plugins: [
        sitemapPlugin({
            origin,
            exclude: []
        }),
        s3adapter({})
    ]
}

export default config