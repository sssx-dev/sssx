import { resolveImages } from "../plugins/resolveImages";
import { getRoute } from "../utils/getRoute";
import { rimraf } from "../utils/rimraf";
import { getCommonBuildOptions } from "../utils/settings";
import { generateClient } from "./generateClient";
import { generateSSR } from "./generateSSR";
import { renderSSR } from "./renderSSR";
import { routeToFileSystem } from "./routes";

export const buildRoute = async (
  url: string,
  outdir: string,
  base: string,
  props: Record<string, any> = {}
) => {
  const route = getRoute(url);
  const ssrFile = `${outdir}/ssr.js`;

  await routeToFileSystem(`${base}pages/`);

  console.log({ route });

  // creating this inside outdir
  if (route !== "/") outdir += route;

  rimraf(outdir);

  const common = getCommonBuildOptions();
  await generateSSR(base, route, ssrFile, common, [
    resolveImages(outdir, true),
  ]);
  await renderSSR(ssrFile, outdir, props);
  await generateClient(
    base,
    route,
    outdir,
    common,
    {},
    [resolveImages(outdir)],
    props
  );
};
