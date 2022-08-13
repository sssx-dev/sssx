// import type { BuildOptions } from "esbuild";
import type { CompileOptions } from "svelte/types/compiler";
import type { Plugin } from "./Plugin";

// Some other Config examples

// https://kit.svelte.dev/docs/configuration
// https://github.com/sveltejs/kit/blob/master/packages/kit/types/index.d.ts#L97

// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://github.com/vercel/next.js/blob/canary/packages/next/server/config-shared.ts#L137

// https://github.com/Elderjs/ts-template/blob/master/elder.config.cjs

export interface Config extends Record<string, unknown> {
    /**
     * Domain + protocol of where your website will be hosted.
     * @example https://www.example.com
     */
    origin: string

    /**
     * Destination directory
     * @default ".sssx"
     */
    distDir: string

    /**
     * Destination directory
     * @default "dist"
     */
    outDir: string;

    /**
     * Destination directory for JS code
     * @default "__SSSX__"
     */
    appDir: string;

    /**
     * Deploy a SSSX website under a sub-path of a domain
     * @default ""
     */
    basePath: string;

    /**
     * Where do you put your routes
     * @default "routes"
     */
    routesPath: string;
    
    /**
     * Name of the typescript file with the route's data functons
     * @default 'route'
     */
    routeName: string;

    /**
     * Where do you put your components
     * @default "components"
     */
    componentsPath: string;

    /**
     * Where do you put your styles
     * @default "styles"
     */
    stylesPath: string;

    compilerOptions?: CompileOptions;

    plugins: Plugin[];

    /**
     * Directory where all routes and components are.
     * @default 'src'
     */
    sourceRoot:string;

    /**
     * Directory where all SSR generated files are stored.
     * @default 'ssr'
     */
    ssrRoot:string;
    
    /**
     * Directory where all compiled TS and Svelte files are stored.
     * @default 'compiled'
     */
    compiledRoot:string;

    /**
     * This prefix will be added to each generated file.
     * @default 'sssx'
     */
    filenamesPrefix:string;
}