import { copyPublic } from './copyPublic.js';
import { BuilderHTML } from './BuilderHTML.js';
import { defaultRenderOptions, type RenderOptions } from '../types/index.js';

export class BuilderRenderer extends BuilderHTML {
  /**
   * SSSX builds only routes that have to be updated.
   */
  public isIncremental = false;
  // TODO: change back to multi-core rendering before the release
  public renderPool = async (renderOptions: RenderOptions = defaultRenderOptions) => {
    const options = Object.assign({}, defaultRenderOptions, renderOptions);
    if (options.updatesOnly) this.isIncremental = true;

    await this.prepareRoutes();
    await this.generateAllPaths();
    await this.generateRequests(options);
    await this.compileAllHTML(this.addedRequests);
    copyPublic(); // should we make a separate function somewhere?
  };
}
