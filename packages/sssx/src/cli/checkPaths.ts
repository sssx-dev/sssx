import { getAllRoutes } from '../utils/getRoutes.js';
import Logger from '@sssx/logger';

export const checkPaths = (args: { paths: string }) => {
  const paths = args.paths.split(`,`).map((a) => a.trim());
  const valid = paths.map((path) => path.startsWith(`/`) && path.endsWith(`/`));
  const isValid = !valid.includes(false);

  const routes = isValid ? getAllRoutes() : [];
  const allPaths = routes.map((r) => r.path);
  const existingPaths = paths.map((path) => allPaths.includes(path));

  // if routes do not exist, show error information
  if (existingPaths.includes(false) || !isValid) {
    let output = `Looks like a path you've specified does not exist:\n`;
    paths.map((path, i) => (output += `${path} – ${existingPaths[i] ? 'exists' : 'not found'}\n`));
    Logger.error(output);
    return process.exit(1);
  }

  return paths;
};
