# Plan:

## create-sssx
- [ ] create-sssx to install a template

## @sssx/aws-s3-cloudfront-adapter

- [ ] add progress bar for S3 adapter
- [ ] add redirect feature on the route level (via S3 metadata)
- [ ] add redirect for entire website level (via CloudFront)

## Rest

- [ ] cache `all()` requests
- [ ] migrate to lerna or nx
- [ ] build function to generate json data file, and fetch it in the frontend easy (dynamic prop?)
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
- [ ] add typescript linter
- [ ] start preparing foundation for the unit tests
- [ ] on the start, show configuration of CPUs and RAM available
- [ ] add linter to all packages and apps
- [ ] documentation

## Done

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

