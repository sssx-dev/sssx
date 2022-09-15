import type { Config } from './Config';
import type { Builder } from '../build/index.js';

export type Plugin = (config: Config, builder: Builder) => Promise<unknown>;
