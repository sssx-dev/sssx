import { checkIfRoutesExist } from '../utils/checkIfRoutesExist.js';

export const checkRoutes = (args: { routes: string }) => {
  const routes = args.routes.split(`,`).map((a) => a.trim());
  const routesExist = checkIfRoutesExist(routes);

  // if routes do not exist, show error information
  if (!routesExist.reduce((previous, current) => current && previous)) {
    let output = `Looks like a route you've specified does not exist:\n`;
    routes.map((r, i) => (output += `${r} – ${routesExist[i] ? 'exists' : 'not found'}\n`));
    console.error(output);
    process.exit(1);
  }

  return routes;
};
