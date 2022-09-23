import fs from 'fs';
import { config } from '@sssx/config';

export const checkIfRoutesExist = (routes: string[] = ['*']) => {
  const base = `${process.cwd()}/${config.sourceRoot}/${config.routesPath}`;
  const names = fs
    .readdirSync(base, { withFileTypes: true })
    .filter((a) => !a.isFile())
    .map((a) => a.name.toLowerCase());

  const exist = routes.map((route) => {
    if (route === `*`) return true;
    if (names.includes(route.trim().toLowerCase())) return true;

    return false;
  });

  return exist;
};
