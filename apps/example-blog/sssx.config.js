const isProduction = process.env.NODE_ENV === 'production';
const origin = `https://sssx.github.io`;

let plugins = {};

/** @type {import('@sssx/sitemap-plugin').Options} */
plugins['@sssx/sitemap-plugin'] = { origin };

// if (isProduction) {
/** @type {import('@sssx/aws-adapter').Options} */
plugins['@sssx/aws-adapter'] = {};
// }

/** @type {import('@sssx/config').Config} */
const config = {
  origin,
  distDir: `.sssx`,
  outDir: `dist`,
  appDir: '__SSSX__',
  basePath: '',
  plugins,
  copyFiles: [{ from: 'assets/images', to: 'images' }]
};

export default config;
