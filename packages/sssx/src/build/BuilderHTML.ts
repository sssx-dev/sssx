import Progress from '../cli/Progress.js';
import { compileHTML } from './compileHTML.js';

import { isProduction, isDev } from '../utils/isDev.js';
import { BuilderRouter } from './BuilderRouter.js';

import type { Route } from '../types/Route.js';

export class BuilderHTML extends BuilderRouter {
  public compileAllHTML = async (routes: Route[]) => {
    const bar = Progress.createBar(
      'HTML',
      routes.length,
      0,
      '{percentage}% | {value}/{total} | {route}',
      { route: '' }
    );

    const timePerPage = [];

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const { path, template, dynamic } = route;
      const { ssrModule, dataModule } = await this.getRouteModules(template);

      // Logger.log('compileAllHTML', template);

      const before = new Date().getTime();
      await compileHTML({
        route,
        outdir: path,
        ssrModule,
        dataModule,
        filesMap: this.filesMap,
        dynamic,
        prettify: isDev,
        minify: isProduction
      });
      const after = new Date().getTime();
      const diff = after - before;
      timePerPage.push(diff);

      bar.update(i, { route: path.replace(process.cwd(), '') });
    }

    const sum = timePerPage.length > 0 ? timePerPage.reduce((a, b) => a + b) : 0;
    const average = sum / routes.length;

    bar.update(routes.length, {
      route: `${average.toFixed(0)} milliseconds per page`
    });

    bar.stop();
  };
}
