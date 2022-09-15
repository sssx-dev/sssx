import chalk from 'chalk';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import fs from '../lib/fs.js';
import { Builder } from '../index.js';
import { clean } from '../build/clean.js';
import { checkRoutes } from './checkRoutes.js';
import { noop } from '../utils/noop.js';
import { config } from '../config/index.js';
import { generateDeclarations } from '../utils/generateDeclarations.js';
import { askQuestion } from './askQuestion.js';

///////////////////////////
const routes = {
  description: 'Specify which route has to be updated. Serparate with comma for muliple routes',
  default: '*'
};
///////////////////////////

yargs(hideBin(process.argv))
  .command('dev', 'Start development server with SSR', noop, async () => {
    const PORT = process.env.PORT || 3000;
    console.log(`Starting development server on http://localhost:${PORT}/`);
    clean(); // only .sssx folder, keep the outDir
    generateDeclarations();

    // watch changes
    const builder = new Builder();
    await builder.setup();

    // could have been a serve function, but if the `route` is not generated, then we need to build in the runtime
  })
  .command('build', 'Start building the static site', { routes }, async (args) => {
    const routes = checkRoutes(args);
    const builder = new Builder();

    if (fs.existsSync(config.outDir) || fs.existsSync(config.distDir)) {
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
  .command('update', 'Start updating the static site', { routes }, async (args) => {
    const routes = checkRoutes(args);

    generateDeclarations();
    const builder = new Builder();
    await builder.setup();
    await builder.renderPool({ routes, updatesOnly: true });
    await builder.processRemovals();
    await builder.runPlugins();
    await builder.finalize();
  })
  .command('dynamic', 'Update only dynamic files', {}, async () => {
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
  .parse();
