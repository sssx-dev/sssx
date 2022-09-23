# Plan:

## @sssx/aws-s3-cloudfront-adapter

- [ ] rename to `@sssx/aws-adapter`
- [ ] find a way to provide a list of redirects via S3 via `x-amz-website-redirect-location` (1000+)
- [ ] add redirect feature on the route level (via S3 metadata)
- [ ] add redirect for entire website level (via CloudFront)
- [ ] implement sync feature?
- [ ] update removal process to remove all files that are not part of the generated folders
- [ ] add an option to not cache certain files/routes
- [x] Send a list of paths changed to S3 plugin
- [x] delete old files, that were removed by the system
- [x] add progress bar for S3 adapter

## @sssx/sitemap-plugin

- [x] add new `route` sitemaps in this `update` mode.
- [x] regerate map using existing map (via file system or by reading a previosly generated map)

## @sssx/dev-server

- [x] add `watch` over filesystem using `chokidar`
- [ ] rebuild a route/path
- [ ] hotreload the page via `websocket` and `window.reload()` KISS
- [ ] stop builder midway, if we need to start over

## @sssx/config

- [ ] put all constants under a helper object/namespace
- [x] move types to separate package
- [x] move config parser to separate package

## @sssx/logger

- [ ] log everything to a file
- [x] add LogLevel verbose

## Documentation

- [ ] prepare basic documentation (internal + external)
- [ ] generate basic documentation website

## Future packages

- [ ] create-sssx to install a template
- [ ] Markdown generation using MDX?
- [ ] SEO tests (length, tags, alts)
- [ ] Web vitals test using Lighthouse?

## Future examples

- [ ] create plugin to generate podcast RSS feed and pages

## Rest

- [ ] find a way to pass generated request directly into the page, and `layout` component
- [ ] Simplify confusion between what's passed in SSSX internally, and what Request is used in the developer space: `UnwrapRouteAll`, `Request`, `RouteParams`, `item`
- [ ] have a way to generate a single url update
- [ ] copy files from public to the root
- [ ] generate a social image locally (use sharp) and place it inside the route's folder (public folder?).
- [ ] BUG: copying `/sssx-monorepo/packages/sssx/dist/build/../patches/svelte.js` gives error from `@sssx/dev-server`

## Backlog

- [ ] extract third-party ESM modules and host them as lib under the `__SSSX__` folder
- [ ] add `dry` mode that shows changes to be made
- [ ] build function to generate json data file, and fetch it in the frontend easy (dynamic prop?)
- [ ] social image generation
- [ ] validate if the internal link exists or not, use <Link> to do automatic verification
- [ ] build first version of a pipeline for production
- [ ] build pipeline for dev (watch + ssr?)
- [ ] build pipeline for production (plugins, updates)
- [ ] prepare separation between production and development
- [ ] hydration could become a layer and an internal plugin, where we do postprocessing for the ssr'ed components/pages
- [ ] figure out hook's version that we run per point (maybe Astro's model with before/after certain points)
- [ ] fix import typescript module/file in the component, it is not passed to `outDir`
- [ ] start preparing foundation for the unit tests
- [ ] on the start, show configuration of CPUs and RAM available
- [ ] rework `replaceImports` with AST based parser/walker
- [ ] add perf with `node_perf`
- [ ] add basic e2e tests
- [ ] add basic unit tests

## Client side

- [ ] dns-prefetch resources
- [ ] lazy loading (async, defer, observer, better web vitals)

## Done

- [x] Move dev server to a standalone package
- [x] Integrate `title`, `description`, `image` in the page, layout and types.
- [x] add simple dev server (run sssx update)
- [x] remove line from `.sssx/routes/route.txt` during process removals
- [x] Slug generation should include title, description, tags (what else?)
- [x] cache `all()` requests (builds `.sssx/routes/route.txt`)
- [x] Access all routes from the helper function
- [x] add typescript linter
- [x] add linter to all packages and apps
- [x] example boilerplate (should it be a generated one via CLI?)
- [x] for each generated component js file, hash its content and add as a hex chunk name
- [x] for build and update add `route` name filter
- [x] add CLI option to only update dynamic files (don't regenerate whole build, don't reupload it)
- [x] dynamic.ts should import svelte components and execute mounting function, script will be deferred. this should be loaded with timestamp like dynamic.js?ts=202208081010 so it would be invoked each time, and not cached, or should we set TTL to 0 instead?
- [x] Added route generation, route check via permalink
- [x] add incremental function to the data file
- [x] process incremental removals
- [x] hash CSS and JS files
- [x] CSS import and static generation with tailwind
- [x] Sitemap generation plugin system
- [x] basic structure to generate routes (slim, fat, data, routes)
- [x] start aggregating build process into a class?
- [x] add build workers
- [x] css is not imported
- [x] missing `.js` everywhere where we import something
- [x] import multiple components
- [x] import data for multile components
- [x] start with a basic build structure and island hydration
- [x] link CSS
- [x] build adapter to deploy to S3 to CloudFront (invalidate)
