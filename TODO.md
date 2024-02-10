## Strategy

- [x] Basic URL -> HTML generator
- [ ] Content editor App via Git
- [ ] Hosting CDN for static content and functions

## Major steps

- [x] Connect to the routing API section
- [x] Create server that requests URL and renders it using Svelte templates and this build system
- [ ] add option to upload assets online
- [ ] keep a list of uploaded and removed files

## Good to have

- [ ] generate sitemap (this is core)
- [ ] generate robots.txt (this is core)
- [x] Simple file system that looks obvious (i.e. SvelteKit)

## General list

- [x] Research Astro, Svelte, Next layouts
- [x] Research esbuild plugins with virtual file system, and custom inputs
- [x] Develop separate systems for dev (vite dev) to run separate modes
- [x] Develop separate systems for build (vite preview) to run separate modes
- [x] https://kit.svelte.dev/docs/advanced-routing
- [x] Add javascript uglifier (compress too)
- [x] Enable assets (image)
- [ ] Enable assets hashed assets (`image.png?hashed` that will be stored in a root)
- [ ] optimize for lighthouse performance: First Contentful Paint (FCP)
- [x] decide how to serve CSS (serve via files)
- [x] get the ssr -> html rendering as a standalone function
- [ ] add logging and error reporting
- [ ] abort if anything fails
- [x] figure out how to import images naturally `import logo from './assets/svelte.svg'`
- [ ] add pretty errors for the `dev` mode – https://www.npmjs.com/package/youch
- [ ] Treat MDSVEX as a first-class citizen (pages + routes + templates)
- [ ] add measure for each build step, so we can perf and optimize later
- [ ] add binary tree for hashes to find a relevant url fast
- [x] implement loader from `param` into `props` from each `data` function inside `+page.ts`
- [ ] add no JS option, so pages would not be hydrated
- [x] robots.txt

- [x] sitemap
- [ ] add tailwind support
- [ ] content URLs generated from `content`
- [ ] implement markdown rendering using `templates` (inspiration: https://docs.astro.build/en/basics/layouts/ )

## Developer Experience

- [x] Add `sssx.config.ts` configuration file
- [x] add `static` folder
- [ ] add watch functionlaity and reload for `dev`
- [ ] Create `$lib` functionality, like in SvelteKit via tsconfig or vite alias
- [x] add progress bar for `build`
