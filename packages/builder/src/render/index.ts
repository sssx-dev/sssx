import { resolveImages } from "../plugins/resolveImages";
import { rimraf } from "../utils/rimraf";
import { getCommonBuildOptions } from "../utils/settings";
import { generateClient } from "./generateClient";
import { generateSSR } from "./generateSSR";
import { renderSSR } from "./renderSSR";

export const buildRoute = async (
  outdir: string,
  ssrFile: string,
  base: string,
  entryPoint: string
) => {
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
