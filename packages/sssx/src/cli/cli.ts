import { dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import yargs from 'yargs';
import path from 'path';
import { hideBin } from 'yargs/helpers';
import { startDevServer } from '@sssx/dev-server';
import { config } from '@sssx/config';

import fs from '../lib/fs.js';
import { Builder } from '../index.js';
import { clean } from '../build/clean.js';
import { checkRoutes } from './checkRoutes.js';
import { noop } from '../utils/noop.js';
import { generateDeclarations } from '../utils/generateDeclarations.js';
import { askQuestion } from './askQuestion.js';
import { checkVerbose } from './checkVerbose.js';
import Logger from '@sssx/logger';
import { checkPaths } from './checkPaths.js';
import e from 'express';

const getVersion = () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const pckg = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), 'utf8')
  );
  return pckg.version;
};

///////////////////////////
const routes = {
  description: 'Specify which route has to be updated. Serparate with comma for muliple routes',
  default: '*'
};

const paths = {
  description: 'Specify which paths has to be updated. Serparate with comma for muliple paths',
  default: ''
};

const verbose = {
  description: 'Enable verbose logging'
};

const yes = {};
///////////////////////////

await yargs(hideBin(process.argv))
  .options({
    yes: {
      alias: 'y',
      description:
        'Automatically answer "yes" to any prompts that npm might print on the command line.'
    }
  })
  .command('dev', 'Start development server with SSR', { routes, verbose }, async (args) => {
    const routes = checkRoutes(args);
    checkVerbose(args as never);

    generateDeclarations();
    startDevServer(routes);
  })
  .command('build', 'Start building the static site', { routes, verbose }, async (args) => {
    checkVerbose(args as never);
    const routes = checkRoutes(args);
    const builder = new Builder();

    if (args.yes || args.y) {
      clean();
    } else if (fs.existsSync(config.outDir) || fs.existsSync(config.distDir)) {
      const shouldContinue = await askQuestion(
        chalk.red('Are you sure you want to remove all previosuly generated files?')
      );

      if (!shouldContinue) {
        return console.log('Aborted');
      }

      clean(); // creates clean build, be removing all previous copies
    } else {
      clean();
    }

    generateDeclarations();

    await builder.setup();
    await builder.renderPool({ routes });
    await builder.runPlugins();
    await builder.finalize();
  })
  .command(
    'update',
    'Start updating the static site. You can specify `routes` or `paths`, but not both.',
    { routes, paths, verbose, yes, y: yes },
    async (args) => {
      checkVerbose(args as never);
      const paths = args.paths.length > 0 ? checkPaths(args) : [];
      const routes = checkRoutes(args);

      // if paths were submitted, force rerender them, otherwise call update fuction for given routes
      const updatesOnly = args.paths.length > 0 ? false : true;

      if (updatesOnly) Logger.log(`Updating following routes`, routes);
      else Logger.log(`Updating following paths`, paths);

      generateDeclarations();
      const builder = new Builder();
      await builder.setup();
      await builder.renderPool({ routes, paths, updatesOnly });
      await builder.processRemovals();
      await builder.runPlugins();
      await builder.finalize();
    }
  )
  .command('dynamic', 'Update only dynamic files', { verbose }, async (args) => {
    checkVerbose(args as never);
    generateDeclarations();
    const builder = new Builder();
    await builder.setup();
    await builder.processRemovals();
    await builder.runPlugins();
    await builder.finalize();
  })
  .command('clean', 'Remove generated folders', noop, async () => {
    clean({ createNewFolder: false });
  })
  .command('generate', 'Generate declaration based on your routes', noop, () => {
    generateDeclarations();
  })
  // .command('html', 'Generate html for the static site', noop, async () => {
  //     console.log(`Generating html`)
  //     await hydrate()
  // })
  .demandCommand(1)
  .version('version', 'Print SSSX version', getVersion())
  .alias('version', 'v')
  .parse();
