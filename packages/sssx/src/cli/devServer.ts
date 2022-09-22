import open from 'open';
import express from 'express';
import * as dotenv from 'dotenv';
import Logger from '@sssx/logger';

import fs from '../lib/fs.js';
import { Builder } from '../build/index.js';
import { config, OUTDIR } from '../config/index.js';
import { generateDeclarations } from '../utils/generateDeclarations.js';

dotenv.config({ path: '.env.local' });

export const startDevServer = async (routes: string[] = []) => {
  const PORT = process.env.PORT || 3000;
  const URL = `http://localhost:${PORT}/`;
  Logger.log(`Starting development server on ${URL}\nfrom ${OUTDIR}`);
  generateDeclarations();

  if (!fs.existsSync(OUTDIR)) {
    routes = ['*']; // render all
  }

  // watch changes
  const builder = new Builder();
  await builder.setup();
  await builder.renderPool({ routes });
  await builder.finalize();

  const app = express();
  const prefix = config.basePath.length === 0 ? '/' : config.basePath;

  app.use((req, res, next) => {
    Logger.log(`dev`, req.path);
    next();
  });

  app.use(prefix, express.static(OUTDIR));
  app.listen(PORT, () => open(URL));
};
