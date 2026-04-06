import { type Config as InnerConfig } from "./config.ts";

export type Config = Partial<InnerConfig>;
export type { SSSXPlugin, BuildContext, RouteContext } from "./plugins/types.ts";
export type { RouteInfo, RouteModule } from "./routes/types.ts";
export type { SEOMeta } from "./plugins/seo.ts";
export type { ImageConfig } from "./plugins/imageOptimizer.ts";
export { responsiveImage, pictureElement, copyImageHashed } from "./plugins/imageOptimizer.ts";
export { generateSEOHead } from "./plugins/seo.ts";
export { getVersion } from "./utils/version.ts";
