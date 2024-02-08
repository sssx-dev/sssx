## Strategy

- [ ] Basic URL -> HTML generator
- [ ] Content editor App via Git
- [ ] Hosting CDN for static content and functions

## Major steps

- [ ] Connect to the routing API section
- [ ] Create server that requests URL and renders it using Svelte templates and this build system
- [ ] add option to upload assets online

## Good to have

- [ ] generate sitemap
- [ ] generate robots.txt
- [x] Simple file system that looks obvious (i.e. SvelteKit)

## TODO

- [x] Research Astro, Svelte, Next layouts
- [x] Research esbuild plugins with virtual file system, and custom inputs
- [x] Develop separate systems for dev (vite dev) to run separate modes
- [ ] Develop separate systems for build (vite preview) to run separate modes
- [x] https://kit.svelte.dev/docs/advanced-routing

## General list

- [x] Add javascript uglifier (compress too)
- [x] Enable assets (image)
- [ ] Enable assets (image) hashes (root dir and sub dirs)
- [ ] optimize for lighthouse performance: First Contentful Paint (FCP)
- [x] decide how to serve CSS (serve via files)
- [ ] add tailwind support
- [x] get the ssr -> html rendering as a standalone function
- [ ] add logging and error reporting
- [ ] abort if anything fails
- [x] figure out how to import images naturally `import logo from './assets/svelte.svg'`
- [ ] add pretty errors for the `dev` mode – https://www.npmjs.com/package/youch
- [ ] Treat MDSVEX as a first-class citizen (pages + routes + templates)
- [ ] add measure for each build step, so we can perf and optimize later
- [ ] add binary tree for hashes to find a relevant url fast

## Developer Experience

- [ ] add watch functionlaity and reload for `dev`
- [ ] Create `$lib` functionality, like in SvelteKit via tsconfig or vite alias
