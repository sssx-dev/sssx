import fs from 'fs/promises'
import { build } from 'esbuild'
import sveltePreprocess from "svelte-preprocess";
import autoprefixer from 'autoprefixer'

import { BASE } from './base.js'
import { wrapHydratableComponents } from './wrapHydratableComponents.js';
import { config } from '../config/index.js'
import { ensureDirExists } from '../utils/ensureDirExists.js';

import esbuildSvelte from "../lib/esbuildSvelte.js";

export const buildSvelte = async (entryPoints:string[], generate: 'dom' | 'ssr' | false = 'ssr', setFilesMap:(k:string,v:string)=>void) => {
    const outdir = `${config.distDir}/${generate === 'ssr' ? 'ssr' : 'compiled'}`
    ensureDirExists(outdir)

    const naming = generate === 'dom' ? { entryNames: `[dir]/${config.filenamesPrefix}-[name]-[hash]` } : {}

    const result = await build({
        entryPoints,
        ...BASE,
        ...naming,
        bundle: false,
        outdir,
        minify: false, //so the resulting code is easier to understand
        sourcemap: "inline",
        write: false,
        plugins: [
            // postCssPlugin(),
            esbuildSvelte({
                compilerOptions: {
                    css: true, // bundles CSS in JS
                    generate,
                    // preserveComments: true,
                    hydratable: true,
                },
                preprocess: [
                    sveltePreprocess({
                        // TODO: should we import postcss.config.js here?
                        // @ts-ignore
                        postcss: [autoprefixer],
                    })
                ]
            }),
        ]
    })
    
    // passing back mapping for component/route.ts -> .ssr/compiled/component/filename-hash.js
    result.outputFiles.map((output, index) => {
        const entry = entryPoints[index].replace(`.svelte`, `.js`)
        setFilesMap(entry, output.path)
    })
    
    // write out generated JS files from svelte files, and replace imports with js files too
    await Promise.all(result.outputFiles.map(async (output) => {
        const path = output.path.split(`/`).slice(0, -1).join(`/`)
        ensureDirExists(path)

        let text = output.text.replaceAll(`.svelte`, `.js`)

        if(
            generate === 'ssr' && 
            (
                output.path.includes(`/${config.routesPath}/`) ||
                output.path.includes(`/${config.componentsPath}/`)
            )
        ){
            text = wrapHydratableComponents(text, output.path)
        }
        await fs.writeFile(output.path, text, {encoding:'utf-8'})
    }))
}