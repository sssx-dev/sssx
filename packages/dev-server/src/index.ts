import path from 'path';
import open from 'open';
import express from 'express';
import * as dotenv from 'dotenv';
import Logger from '@sssx/logger';
import { fs, Builder } from 'sssx';
import { config, OUTDIR, PREFIX } from '@sssx/config';
import chokidar from 'chokidar';
import chalk from 'chalk';

dotenv.config({ path: '.env.local' });

export const startDevServer = async (routes: string[] = []) => {
  const PORT = process.env.PORT || 3000;
  const URL = `http://localhost:${PORT}/`;
  Logger.log(`Starting development server on ${URL}\nfrom ${OUTDIR}`);

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

  const watcher = chokidar.watch(path.resolve(process.cwd(), config.sourceRoot), {
    ignoreInitial: true,
    ignored: [OUTDIR, PREFIX]
  });

  watcher.on('all', async (eventName, path, stats) => {
    Logger.clear();
    Logger.log('dev:watch', chalk.green(eventName), path);

    // rebuilding whole site again, optimise later to rebuild only certain pieces
    const builder = new Builder();
    await builder.setup();
    await builder.renderPool({ routes });
    await builder.finalize();

    open(URL);
  });

  app.use((req, res, next) => {
    Logger.log(`dev:browser`, req.path);
    next();
  });

  app.use(prefix, express.static(OUTDIR));
  app.listen(PORT, () => open(URL));
};
