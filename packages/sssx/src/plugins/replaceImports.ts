import fs from 'fs/promises'
import glob from 'tiny-glob'
import { config } from '../config/index.js';
import type { FilesMap } from '../types/index.js'
import { ensureDirExists } from '../utils/ensureDirExists.js';

const importRe = /import\s+?(?:(?:(?:[\w*\s{},]*)\s+from\s+?)|)(?:(?:".*?")|(?:'.*?'))[\s]*?(?:;|$|)/gi

type Options = {
    css: boolean;
    svelte: boolean;
    matchHashesImports: boolean;
    overwriteOriginal:boolean;
    dst:string;
    filesMap:FilesMap
}

const defaultOptions:Options = {
    css: true,
    svelte: true,
    matchHashesImports: false,
    overwriteOriginal: false,
    dst:'',
    filesMap: {}
}

const getImportsURL = (entry:string) =>
    entry.split(` `).pop()!.replaceAll(`"`,``).replace(`;`,``)

/**
 * Replace only javascript imports in the generated code `component.js` -> `prefix-component-hash.js`
 * @param entry import line from the code
 * @param file source code file path
 * @param {Options} options replacement options
 * @param {string} code source code content
 * @returns {string} modifed source code content
 */
const replaceImportsToHashedImports = (entry:string, file:string, options:Options, code:string) => {
    const relativePath = getImportsURL(entry)
    const filename = relativePath.split(`/`).pop()!
    const ext = filename.split(`.`).pop()!

    // TODO: figure out what to do with `import dayjs from "dayjs"`
    if(
        relativePath !== `sssx` &&
        !relativePath.startsWith(`./.`) &&
        !relativePath.startsWith(`./`) &&
        !relativePath.startsWith(`../.`) &&
        !relativePath.startsWith(`../`)
    ) return code
    
    let upDirs = 0
    let path = relativePath
    // TODO: refactor this to make it simpler
    while(path.startsWith(`../`)){
        upDirs++
        path = path.replace(`../`,``)
    }

    const route = file.split(`/`).slice(2,-1-upDirs).join(`/`)

    if(
        !filename.startsWith(config.filenamesPrefix) && 
        !filename.endsWith(`.css`)
    ){
        const originalSourcePath = [config.sourceRoot, route, path]
        .filter(a => a.length > 0)
        .join(`/`)
        .replaceAll(`/./`,`/`) // convert /src/routes/./blog/ into /src/routes/blog/
        console.log(`replaceImportsToHashedImports`, originalSourcePath)
        try{
            const newSourcePath = options.filesMap[originalSourcePath]
            // TODO: check if first component is the one we want
            const newFilename = newSourcePath[0].split(`/`).pop()!
            const newRelativePath = relativePath.replace(filename, newFilename)
            // console.log(`replaceImports`, {relativePath, newRelativePath})
            code = code.replaceAll(`"${relativePath}"`, `"${newRelativePath}"`)
        }catch(err){
            console.error(`replaceImportsToHashedImports err`, {originalSourcePath, file}, err)
            // console.log(`==============`)
            // console.log()
            // console.log(`==============`)
        }
    }

    return code
}

const replaceFile = async (file:string, options:Options) => {
    // console.log(`replaceFile`, [file, fileTarget])
    
    let code = await fs.readFile(file, {encoding:'utf-8'})
    const matches = code.match(importRe)

    const coreSvelteName = options.filesMap[`svelte.js`][0].split(`/`).pop()!

    if(matches)
    matches.map(entry => {
        if(options.css && entry.includes(`.css`)) {
            code = code.replace(entry, `// ${entry}`)
        }

        if(options.svelte) {
            if(entry.includes(`svelte/internal`))
                code = code.replace(entry, entry.replace(`"svelte/internal"`, `"../${coreSvelteName}"`))
            else if(entry.includes(`svelte`))
                code = code.replace(entry, entry.replace(`"svelte"`, `"../${coreSvelteName}"`))
        }

        if(options.matchHashesImports) {
            code = replaceImportsToHashedImports(entry, file, options, code)
        }
    })
    
    if(options.dst.length > 0){
        const suffix = file.split(`/${config.compiledRoot}/`)[1]
        const fileTarget = `${options.dst}/${suffix}`
        const fileTargetPath = fileTarget.split(`/`).slice(0,-1).join(`/`)
        ensureDirExists(fileTargetPath)
        await fs.writeFile(fileTarget, code)
    }
    if(options.overwriteOriginal) await fs.writeFile(file, code)
}

export const replaceImports = async (globWildcard:string, inputOptions:Partial<Options> = defaultOptions) => {
    // console.log(`replaceImports`, globWildcard)
    const options:Options = Object.assign({}, defaultOptions, inputOptions)
    const files = await glob(globWildcard)
    await Promise.all(files.map(file => replaceFile(file, options)))
}