import type { Route } from 'sssx';
import type { Config } from '@sssx/config';

export const routeToMap = (requests: Route[], config: Config) => {
  const map: Record<string, string[]> = {};

  requests.map((r) => {
    const template = r.template.split(`/`)[3];
    const path = config.origin + r.path.split(config.outDir).pop();

    if (!map[template]) map[template] = [];

    map[template].push(path);
  });

  return map;
};
