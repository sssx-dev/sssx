// import sitemapPlugin from '@sssx/sitemap-plugin';
// import s3adapter from '@sssx/aws-s3-cloudfront-adapter'

const isProduction = process.env.NODE_ENV === 'production';
const origin = `https://sssx.github.io`;

/** @type {import('sssx').Config} */
const config = {
  origin,
  distDir: `.sssx`,
  outDir: `dist`,
  appDir: '__SSSX__',
  basePath: '',
  plugins: [
    // sitemapPlugin({
    //     origin,
    //     exclude: []
    // }),
    // isProduction && s3adapter({})
  ]
};

export default config;
