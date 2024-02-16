import fs from "node:fs";
import path from "node:path";
import type { OnLoadArgs, OnResolveArgs, Plugin } from "esbuild";
import { type Config } from "../config.ts";
import { hashFile } from "../utils/hashFile.ts";

// const imagesRegExp = /^.*\.(svg|png|jpeg|jpg|webp)?$/;
const imagesRegExp = /^.*\.(svg|png|jpeg|jpg|webp)?(\?.*)?$/; // works for `image.jpg?global`

const getPath = (args: OnResolveArgs | OnLoadArgs) => {
  const argsPath = args.path.includes("?")
    ? args.path.split("?")[0]
    : args.path;
  const isGlobal = args.path.endsWith("?global");

  return { path: argsPath, isGlobal };
};

// TOOD: remember to generate ambient types for svelte here
export const resolveImages = (
  outdir: string,
  config: Config,
  copyAssets: boolean
): Plugin => ({
  name: "resolveImages",
  setup(build) {
    const namespace = "images-namespace";
    build.onResolve({ filter: imagesRegExp }, async (args) => {
      // console.log(`onResolve`, args);
      const { path: argsPath, isGlobal } = getPath(args);

      const srcDir = path.dirname(args.importer);
      const src = path.normalize(`${srcDir}/${argsPath}`);
      const dst = path.normalize(
        `${outdir}/${argsPath.replaceAll("../", "/")}` // should always go into `outdir`
      );
      const dir = path.dirname(dst);

      if (isGlobal) {
        const globalDir = path.normalize(
          `${config.outDir}/${config.globalDir}`
        );
        if (!fs.existsSync(globalDir)) {
          fs.mkdirSync(globalDir, { recursive: true });
        }

        const { name, ext } = path.parse(argsPath);
        const hash = await hashFile(src);
        const filename = `${name}.${hash}${ext}`;
        const globalDst = path.normalize(`${globalDir}/${filename}`);

        const newArgsPath = path.normalize(`/${config.globalDir}/${filename}`);

        // console.log({ globalDst, argsPath, newArgsPath });

        fs.copyFileSync(src, globalDst);

        return {
          path: newArgsPath,
          namespace,
        };
      }

      if (copyAssets) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.copyFileSync(src, dst);
      }

      return {
        path: argsPath,
        namespace,
      };
    });

    build.onLoad({ filter: /.*/, namespace }, (args) => {
      // console.log(`onLoad`, args);
      const { path: argsPath } = getPath(args);

      const contents = argsPath.replace("../", "./");
      return {
        contents,
        loader: "text",
      };
    });
  },
});
