# Plan:

## create-sssx

- [ ] create-sssx to install a template

## @sssx/aws-s3-cloudfront-adapter

- [x] add progress bar for S3 adapter
- [ ] add an option to not cache certain files/routes
- [ ] add redirect feature on the route level (via S3 metadata)
- [ ] add redirect for entire website level (via CloudFront)
- [ ] delete old files, that were removed by the system

# Documentation

- [ ] prepare basic documentation (internal + external)
- [ ] generate basic documentation website

## Rest

- [ ] Send a list of paths changed to S3 plugin
- [ ] have a way to generate a single url update
- [ ] update removal process to remove all files that are not part of the generated folders
- [x] add CLI option to only update dynamic files (don't regenerate whole build, don't reupload it)
- [ ] Access all routes from the helper function
- [ ] Slug generation should include title, description, tags (what else?)
- [ ] build function to generate json data file, and fetch it in the frontend easy (dynamic prop?)
- [ ] cache `all()` requests
- [ ] social image generation
- [ ] lazy loading (async, defer, observer, better web vitals)
- [ ] validate if the internal link exists or not, use <Link> to do automatic verification
- [ ] build first version of a pipeline for production
- [ ] build pipeline for dev (watch + ssr?)
- [ ] build pipeline for production (plugins, updates)
- [ ] prepare separation between production and development
- [ ] consider mdsvex for markdown provider (generate static only version)
- [ ] for each generated component js file, hash its content and add as a hex chunk name
- [ ] copy files from public to the root
- [ ] dns-prefetch resources
- [ ] hydration could become a layer and an internal plugin, where we do postprocessing for the ssr'ed components/pages
- [ ] figure out hook's version that we run per point (maybe Astro's model with before/after certain points)
- [ ] add perf with `node_perf`
- [ ] fix import typescript module/file in the component, it is not passed to `outDir`
- [ ] example boilerplate (should it be a generated one via CLI?)
- [ ] start preparing foundation for the unit tests
- [ ] on the start, show configuration of CPUs and RAM available
- [ ] add typescript linter
- [ ] add linter to all packages and apps
- [ ] create plugin to generate podcast RSS feed and pages

## Done

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
