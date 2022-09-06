import workerpool from 'workerpool';

import { Builder } from './index.js';
import type { ItemPathTemplate } from './prepareRoute.js';

const render = async (paths: ItemPathTemplate[]) => {
  const builder = new Builder({ isWorker: true });
  // we need to load modules and data, bcause worker runs in a separate process without memory sharing
  await builder.prepareRoutes();
  await builder.render(paths);
};

workerpool.worker({ render });
