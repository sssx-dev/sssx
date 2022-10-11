import type { BuildOptions } from 'esbuild';
import { getBanner } from '../../utils/getBanner.js';

export const BASE: BuildOptions = {
  bundle: true,
  mainFields: ['svelte', 'browser', 'module', 'main'],
  minify: true,
  logLevel: 'info',
  splitting: true,
  format: `esm`,
  banner: {
    js: `// ${getBanner()}`
  }
};
