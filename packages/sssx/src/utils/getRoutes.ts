import path from 'path';
import fs from '../lib/fs.js';
import { GENERATED_ROUTES } from '@sssx/config';
import type { Route } from '../types/Route.js';
import Logger from '@sssx/logger';

export const getRoutes = (route: string) => {
  const raw = fs.readFileSync(path.resolve(GENERATED_ROUTES, `${route}.txt`), 'utf8').split(`\n`);
  const array = raw.map((line) => JSON.parse(line) as Route);

  Logger.verbose('getRoutes', array);

  return array;
};

export const getAllRoutes = () => {
  const names = fs
    .readdirSync(GENERATED_ROUTES)
    .filter((name) => !name.startsWith(`.`))
    .map((name) => name.split(`.`)[0]);

  const routes = names.map(getRoutes).flat();
  return routes;
};
