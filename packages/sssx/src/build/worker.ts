import workerpool from 'workerpool';

import { Builder } from './index.js';
import type { ItemPathTemplate } from './types.js';

const render = async (paths: ItemPathTemplate[]) => {
  const builder = new Builder({ isWorker: true });
  // we need to load modules and data, bcause worker runs in a separate process without memory sharing
  await builder.prepareRoutes();
  await builder.compileAllHTML(paths);
};

workerpool.worker({ render });
