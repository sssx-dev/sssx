# SSSX

<a href="https://twitter.com/sssxdev?ref_src=twsrc%5Etfw" class="twitter-follow-button" data-show-count="false">Follow @sssxdev</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Fast SSG framework built on top of Svelte and esbuild, optimized for SEO, featuring islands architecture with partial hydration.

This framework is built to deliver fast generation of millions of pages and reduce deployment costs, while providing great development experience.

❌ Not ready for production yet. Use it at your own risk. ❌

```shell
npm install -g sssx
```

## Name

| Definition                   | Abbreviation |
| ---------------------------- | ------------ |
| Svelte Static Site Generator | SSSG         |
| Svelte Server Side Rendering | SSSR         |
| =                            | SSSX         |

## Demo

<iframe width="560" height="315" src="https://www.youtube.com/embed/8gNkKyfspl8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Overview

Why another SSG?

This project was created from the need to manage sites with millions of pages, with making static site generation a primary use case, and SEO optimisation its first goal.

### Features

- 📈 Incremental updates `sssx update`
- 🚀 1000ms or less spent on building each page
- 👍 Static pages don't need JavaScript whatsoever
- 🏝️ Island architecture for hydration (Using Svelte components)
- 💦 Progressive hydration
- 📦 Small size of JavaScript overhead (thanks to Svelte)
- 💪 ESM first, no more enormous CommonJS bundles (thanks to Esbuild)
- ⚡️ Dynamic JS injection per route

## Structure

This repository is structured as a monorepo and uses workspaces.

To build all dependencies at once use `tsc --build --watch`.

### Packages

- sssx (main source code of the SSG)
- eslint-config-sssx (ESLint configuration)
- aws-s3-cloudfront-adapter (Plugin to upload generated website to S3 and CloudFront)
- sitemap-plugin (Plugin to generate robots.txt and sitemaps)

## Plugins

- [x] [@sssx/sitemap-plugin](https://github.com/sssx-dev/sssx/tree/master/packages/sitemap-plugin) generates `robots.txt` and sitemaps
- [x] [@sssx/aws-s3-cloudfront-adapter](https://github.com/sssx-dev/sssx/tree/master/packages/aws-s3-cloudfront-adapter) uploads website content to S3 and refreshes CloudFront distribution for the changed URLs.

## Roadmap

Your feedback is welcome.

Check the roadmap [here](https://github.com/sssx-dev/sssx/blob/master/ROADMAP.md).

## Getting started

To run an example project use the following:

```shell
cd apps/example-blog
npm install
sssx dev # or sssx build
```

## Development

```shell
npm install
tsc --build --watch
```

## Thank you

Inspirations are drawn from:

- [Next.js](https://github.com/vercel/next.js/)
- [Elder.js](https://github.com/Elderjs/elderjs)
- [SvelteKit](https://github.com/sveltejs/kit)
- [Astro](https://github.com/withastro/astro)
- [Esbuild](https://github.com/evanw/esbuild)
- [Rust](https://github.com/rust-lang/rust)

## License

Copyright © 2022 [Eugene Hauptmann](https://github.com/eugenehp)

[MIT](https://github.com/sssx-dev/sssx/blob/master/LICENSE)
