// import sitemapPlugin from '@sssx/sitemap-plugin';
// import s3adapter from '@sssx/aws-s3-cloudfront-adapter'

const isProduction = process.env.NODE_ENV === 'production';
const origin = `https://sssx.github.io`;

// console.log('hello from sssx.config.js');

let plugins = {};
plugins['@sssx/sitemap-plugin'] = { origin, exclude: [] };

if (isProduction) {
  plugins['@sssx/aws-s3-cloudfront-adapter'] = {};
}

/** @type {import('sssx').Config} */
const config = {
  origin,
  distDir: `.sssx`,
  outDir: `dist`,
  appDir: '__SSSX__',
  basePath: '',
  plugins
  //   plugins: {
  //     sitemapPlugin({
  //         origin,
  //         exclude: []
  //     }),
  //     isProduction && s3adapter({})
  //   }
};

export default config;
