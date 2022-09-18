export { clean } from './build/clean.js';
export { Builder } from './build/index.js';
export { getPermalink } from './build/getPermalink.js';
export { default as Progress } from './cli/Progress.js';
export { default as fs } from './lib/fs.js'; // specifal FS proxy to collect all written filenames

export type { Config } from './types/Config.js';
export type { Plugin } from './types/Plugin';
export type { UnwrapRouteAll, RoutePropsFn, RoutePermalinkFn } from './types/Route.js';
export type { SvelteComponentProps } from './types/Svelte.js';

export default {};
