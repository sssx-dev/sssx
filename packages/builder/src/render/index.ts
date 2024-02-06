import { resolveImages } from "../plugins/resolveImages";
import { getRoute } from "../utils/getRoute";
import { rimraf } from "../utils/rimraf";
import { getCommonBuildOptions } from "../utils/settings";
import { generateClient } from "./generateClient";
import { generateSSR } from "./generateSSR";
import { renderSSR } from "./renderSSR";

export const buildRoute = async (
  url: string,
  outdir: string,
  base: string,
  entryPoint: string = "+page.svelte"
) => {
  const route = getRoute(url);
  const ssrFile = `${outdir}/ssr.js`;

  rimraf(outdir);

  const common = getCommonBuildOptions();
  await generateSSR(base, entryPoint, ssrFile, common, [
    resolveImages(outdir, true),
  ]);
  await renderSSR(ssrFile, outdir);
  await generateClient(base, entryPoint, outdir, common, {}, [
    resolveImages(outdir),
  ]);
};
