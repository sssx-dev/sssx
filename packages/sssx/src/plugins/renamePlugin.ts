import path from 'path'
import { readFileSync } from 'fs'
import { inspect } from 'util'
import type { OnLoadResult, Plugin } from "esbuild"
import typescript from 'typescript'

// tsc --target esnext --moduleResolution node --allowSyntheticDefaultImports true renamePlugin.ts
const TYPESCRIPT_FILTER = /\.ts$/;

export const renamePlugin = ({
    tsconfigPath = path.join(process.cwd(), './tsconfig.json'),
    force: forceTsc = false,
}):Plugin => ({
    name: 'env',
    setup(build) {
        let parsedTsConfig:any
        
        build.onLoad({filter: TYPESCRIPT_FILTER}, args => {
            // console.log(`build.onLoad`, tsconfigPath, args)
            if(!parsedTsConfig) {
                parsedTsConfig = parseTsConfig(tsconfigPath, process.cwd());
                if (parsedTsConfig.sourcemap) {
                  parsedTsConfig.sourcemap = false;
                  parsedTsConfig.inlineSources = true;
                  parsedTsConfig.inlineSourceMap = true;
                }
            }

            // console.log(`parsedTsConfig`, parsedTsConfig)
        
            // Just return if we don't need to search the file.
            if (
                !forceTsc &&
                (
                    !parsedTsConfig ||
                    !parsedTsConfig.options ||
                    !parsedTsConfig.options.emitDecoratorMetadata
                )
            ) return

            // console.log(`forceTsc`, forceTsc)

            // from https://github.com/thomaschaaf/esbuild-plugin-tsc
            const ts = readFileSync(args.path, {encoding: 'utf-8'})
            .replaceAll(`.svelte`, `.js`)

            // console.log(`============`)
            // console.log(args.path)
            // console.log(`============`)
            // console.log(ts)

            const program = typescript.transpileModule(ts, {compilerOptions: parsedTsConfig.options})
            const contents = `// __PURE__ ==================== ${args.path} \n\n` + program.outputText

            let result:OnLoadResult = {
                contents
            }

            return result
        })
    }
})



function parseTsConfig(tsconfig:string, cwd = process.cwd()) {
    const fileName = typescript.findConfigFile(
      cwd,
      typescript.sys.fileExists,
      tsconfig
    );
  
    // if the value was provided, but no file, fail hard
    if (tsconfig !== undefined && !fileName)
      throw new Error(`failed to open '${fileName}'`);
  
    let loadedConfig = {};
    let baseDir = cwd;
    let configFileName;
    if (fileName) {
        const text = typescript.sys.readFile(fileName);
        if (text === undefined) throw new Error(`failed to read '${fileName}'`);
  
        const result = typescript.parseConfigFileTextToJson(fileName, text);
  
        if (result.error !== undefined) {
            printDiagnostics(result.error);
            throw new Error(`failed to parse '${fileName}'`);
        }
    
        loadedConfig = result.config;
        baseDir = path.dirname(fileName);
        configFileName = fileName;
    }
  
    const parsedTsConfig = typescript.parseJsonConfigFileContent(
        loadedConfig,
        typescript.sys,
        baseDir
    );

    if (parsedTsConfig.errors[0]) printDiagnostics(parsedTsConfig.errors);

    return parsedTsConfig;
}

function printDiagnostics(...args:any[]) {
    console.log(inspect(args, false, 10, true));
}
