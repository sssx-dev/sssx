import fs from "fs";
import path from "path";
import { Plugin } from "esbuild";

const imagesRegExp = /^.*\.(svg|png|jpeg|jpg|webp)$/;

// TOOD: remember to generate ambient types for svelte here
export const resolveImages = (outdir: string, copyAssets = false): Plugin => ({
  name: "resolveImages",
  setup(build) {
    const namespace = "images-namespace";
    build.onResolve({ filter: imagesRegExp }, (args) => {
      //   console.log(`onResolve`, args);

      // TODO: this would be the place to introduce hashing hash/original_name.jpeg
      if (copyAssets) {
        const srcDir = path.dirname(args.importer);
        const src = path.normalize(`${srcDir}/${args.path}`);
        const dst = path.normalize(`${outdir}/${args.path}`);
        const dir = path.dirname(dst);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.copyFileSync(src, dst);
      }

      return {
        path: args.path,
        namespace,
      };
    });

    build.onLoad({ filter: /.*/, namespace }, (args) => {
      //   console.log(`onLoad`, args);

      return {
        contents: args.path,
        loader: "text",
      };
    });
  },
});
