import sitemapPlugin from '@sssx/sitemap-plugin'

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
        })
    ]
}

export default config