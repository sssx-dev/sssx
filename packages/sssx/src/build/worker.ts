import workerpool from 'workerpool';

import { Builder } from './index.js';
import type { Route } from '../types/Route.js';

const render = async (routes: Route[]) => {
  const builder = new Builder({ isWorker: true });
  // we need to load modules and data, bcause worker runs in a separate process without memory sharing
  await builder.prepareRoutes();
  await builder.compileAllHTML(routes);
};

workerpool.worker({ render });
