const isProduction = process.env.NODE_ENV === 'production';
const origin = `https://sssx.github.io`;

let plugins = {};

/** @type {import('@sssx/sitemap-plugin').Options} */
plugins['@sssx/sitemap-plugin'] = { origin };

if (isProduction) {
  /** @type {import('@sssx/aws-s3-cloudfront-adapter').Options} */
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
};

export default config;
