import Progress from '../cli/Progress.js';
import { compileHTML } from './compileHTML.js';

import { isProduction, isDev } from '../utils/isDev.js';
import { BuilderRouter } from './BuilderRouter.js';

import type { Request } from '../types/Route.js';

export class BuilderHTML extends BuilderRouter {
  public compileAllHTML = async (requests: Request[]) => {
    const bar = Progress.createBar(
      'HTML',
      requests.length,
      0,
      '{percentage}% | {value}/{total} | {route}',
      { route: '' }
    );

    const timePerPage = [];

    for (let i = 0; i < requests.length; i++) {
      const { data, path, template, dynamic } = requests[i];
      const { ssrModule, dataModule } = await this.getRouteModules(template);

      // Logger.log('compileAllHTML', template);

      const before = new Date().getTime();
      await compileHTML({
        data,
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

    const sum = timePerPage.reduce((a, b) => a + b);
    const average = sum / requests.length;

    bar.update(requests.length, {
      route: `${average.toFixed(0)} milliseconds per page`
    });

    bar.stop();
  };
}
