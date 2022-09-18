import fs from '../lib/fs.js';
import { build } from 'esbuild';
import { BASE } from './base.js';
import { config } from '../config/index.js';
import { ensureDirExists } from '../utils/ensureDirExists.js';

export const buildSvelteCore = async (entryPoints: string[], outdir = `./dist/out`) => {
  const result = await build({
    entryPoints,
    entryNames: `[dir]/${config.filenamesPrefix}-[name]-[hash]`,
    ...BASE,
    minify: false,
    outdir,
    write: false,
    logLevel: 'silent'
  });

  await Promise.all(
    result.outputFiles.map(async (output) => {
      const path = output.path.split(`/`).slice(0, -1).join(`/`);
      ensureDirExists(path);

      // TODO: refactor via patch or official PR allowing target to be array of elements
      // monkey patching Svelte
      // https://github.com/sveltejs/svelte/blob/0a086c85e43d7290c24b60c10355915b8f9d36ea/src/runtime/internal/dom.ts#L167
      // https://github.com/sveltejs/svelte/blob/dbbac2837e987ab3cf76ea901e4956c057919a96/src/runtime/internal/Component.ts#L161
      const text = output.text
        // .replace(
        //     `function append_hydration(target, node) {`,
        //     `function append_hydration(target, node) {\nconsole.log('append_hydration', target, node)`
        // )
        .replace(
          // fix CSS injection
          `const append_styles_to = get_root_for_style(target);`,
          `const append_styles_to = get_root_for_style( Array.isArray(target) ? target[0] : target);`
        )
        .replace(
          `target.insertBefore(node, target.actual_end_child);`,
          `target.insertBefore && target.insertBefore(node, target.actual_end_child);`
        )
        .replace(
          `const nodes = children(options.target);`,
          `
            const isArray = Array.isArray(options.target)
            const nodes = isArray ? options.target : children(options.target);
            
            const childNodes = options.target
            const firstChild = childNodes[0]

            // Simulating virtual NodeEx element, based off Node
            if(isArray)
            options.target = {
                firstChild,
                childNodes
            }

            `
        );

      await fs.writeFile(output.path, text, { encoding: 'utf-8' });
    })
  );

  return result.outputFiles[0].path;
};
