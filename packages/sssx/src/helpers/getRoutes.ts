import path from 'path';
import fs from '../lib/fs.js';
import { GENERATED_ROUTES } from '../config/index.js';
import type { RouteParams } from '../types/Route.js';
import Logger from '@sssx/logger';

export const getRoutes = (route: string) => {
  const raw = fs.readFileSync(path.resolve(GENERATED_ROUTES, `${route}.txt`), 'utf8').split(`\n`);
  const array = raw.map((line) => JSON.parse(line).item as RouteParams);

  Logger.verbose('getRoutes', array);

  return array;
};
