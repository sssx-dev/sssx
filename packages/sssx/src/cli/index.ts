#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { Builder } from '../index.js';
import { clean } from '../build/clean.js';
import { generateDeclarations } from '../utils/generateDeclarations.js';
import { checkRoutes } from './checkRoutes.js';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

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
    clean();
    generateDeclarations();

    await builder.setup();
    await builder.renderPool(routes);
    await builder.runPlugins();
  })
  .command('update', 'Start updating the static site', { routes }, async (args) => {
    const routes = checkRoutes(args);

    generateDeclarations();
    const updatesOnly = true;
    const builder = new Builder();
    await builder.setup();
    await builder.renderPool(routes, updatesOnly);
    await builder.runPlugins();
    await builder.processRemovals();
  })
  .command('dynamic', 'Update only dynamic files', {}, async () => {
    generateDeclarations();
    const builder = new Builder();
    await builder.setup();
    await builder.runPlugins();
    await builder.processRemovals();
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
