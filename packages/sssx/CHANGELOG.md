# sssx

## 0.2.0

### Minor Changes

- [x] Research Astro, Svelte, Next layouts
- [x] Research esbuild plugins with virtual file system, and custom inputs
- [x] Develop separate systems for dev (vite dev) to run separate modes
- [x] Develop separate systems for build (vite preview) to run separate modes
- [x] https://kit.svelte.dev/docs/advanced-routing
- [x] Add javascript uglifier (compress too)
- [x] Enable assets (image)
- [x] Enable assets stored globally like `image.png?global` will be stored in `/global/image.hash.png`
- [x] decide how to serve CSS (serve via files)
- [x] get the ssr -> html rendering as a standalone function
- [x] figure out how to import images naturally `import logo from './assets/svelte.svg'`
- [x] implement loader from `param` into `props` from each `data` function inside `+page.ts`
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
- [x] figure out what to do when you remove routes or files `sssx.files.ts` (get from URLs and edit files?)
- [x] generate list of removed URLs and then go over it to remove the URLs from the files

#### Developer Experience Changes

- [x] add bin cli
- [x] Add `sssx.config.ts` configuration file
- [x] add `static` folder
- [x] add watch functionlaity and reload for `dev`
- [x] add livereload
- [x] add progress bar for `build`
- [x] add a way to pass `unified`, `remark`, `rehype` build options to `markdown` from config
- [x] add `sssx build <url>` that builds one particular URL
- [x] add `sssx urls prefix/` that returns list of URLs with established prefix
- [x] add `sssx dev open`
- [x] add `sssx clean`

## 0.1.0

### Minor Changes

- 4d5a3f1: Just a minor bump
- Added markdown support. Added copy files support.
- 237b3f8: Added changeset to manage versioning

### Patch Changes

- 1b35fd5: Added markdown support
- cefbd17: updated readme
