## Major steps

- [ ] Connect to the routing API section
- [ ] Create server that requests URL and renders it using Svelte templates and this build system
- [ ] add option to upload assets online

## Good to have

- [ ] generate sitemap
- [ ] generate robots.txt
- [ ] Simple file system that looks obvious (i.e. SvelteKit)

## TODO

- [ ] Research Astro, Svelte, Next layouts
- [ ] Research esbuild plugins with virtual file system, and custom inputs
- [ ] Develop separate systems for dev and build (vite style preview) to run separate modes

## General list

- [ ] Add javascript uglifier (compress too)
- [ ] Enable assets (image) hashes
- [ ] Clearly separate public assets in `public` folder and inside `src/assets`
- [ ] optimize for lighthouse performance: First Contentful Paint (FCP)
- [ ] improve hashing of names
- [ ] decide how to serve CSS
- [ ] add tailwind support
- [ ] get the ssr -> html rendering as a standalone function
- [ ] add logging and error reporting
- [ ] abort if anything fails
- [ ] figure out how to import images naturally `import logo from './assets/svelte.svg'`
- [ ] add pretty errors for the `dev` mode – https://www.npmjs.com/package/youch
- [ ] Treat MDSVEX as a first-class citizen (pages + routes + templates)
