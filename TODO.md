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
- [x] Enable assets stored globally like `image.png?global` will be stored in `/global/image.hash.png`
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
- [x] add tailwind support
- [x] content URLs generated from `content`
- [x] implement markdown rendering using `templates` (inspiration: https://docs.astro.build/en/basics/layouts/ )
- [x] make sure content images are copied too
- [x] add i18n support inside of `content`
- [x] remove `console.log` from the templates
- [x] fix images copied two times inside `/posts/post3/`
- [x] in `build` flow add output with all files written (do a glob) and then add it to the index file that keeps all the files as `sssx.files.ts`
- [x] keep index of URLs as `sssx.urls.ts`
- [ ] add option to merge css and js into single html file
- [x] figure out what to do when you remove routes or files `sssx.files.ts` (get from URLs and edit files?)
- [x] generate list of removed URLs and then go over it to remove the URLs from the files
- [ ] add a check that there no similar routes in file system, plain, content, if there are, then alert the user
- [ ] run `a11y` checks
- [ ] run SEO checks (metatags, description, title, language, etc.)
- [ ] updated changelog inside `sssx`

## Developer Experience

- [x] add bin cli
- [x] Add `sssx.config.ts` configuration file
- [x] add `static` folder
- [x] add watch functionlaity and reload for `dev`
- [x] add livereload
- [ ] Create `$lib` functionality, like in SvelteKit via tsconfig or vite alias
- [x] add progress bar for `build`
- [ ] add type for markdown imports inside templates
- [x] add a way to pass `unified`, `remark`, `rehype` build options to `markdown` from config
- [x] add `sssx build <url>` that builds one particular URL
- [x] add `sssx urls prefix/` that returns list of URLs with established prefix
- [x] add `sssx dev open`
- [x] add `sssx clean`
