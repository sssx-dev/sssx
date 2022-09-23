import type { Config } from '@sssx/config';
import type { Builder } from '../build/index.js';

export type Plugin = (config: Config, builder: Builder) => Promise<unknown>;
