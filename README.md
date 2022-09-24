# SSSX

[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/sssxdev.svg?style=social&label=Follow%20%40sssxdev)](https://twitter.com/sssxdev)
[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/eugenehp.svg?style=social&label=Follow%20%40eugenehp)](https://twitter.com/eugenehp)
[![Youtube URL](https://shields.io/badge/views-2k-red?logo=youtube&style=social)](https://www.youtube.com/channel/UCYzzLilEQdBG0Jj1JhVtYYg)

[![GitHub license](https://img.shields.io/github/license/sssx-dev/sssx.svg?color=blue&style=for-the-badge)](./LICENSE)
[![npm](https://img.shields.io/npm/v/sssx.svg?color=green&style=for-the-badge)](https://www.npmjs.com/package/sssx)
[![npm downloads](https://img.shields.io/npm/dw/sssx.svg?label=npm%20downloads&style=for-the-badge)](https://npmcharts.com/compare/sssx?minimal=true)
[![total npm downloads](https://img.shields.io/npm/dt/sssx.svg?label=total%20npm%20downloads&style=for-the-badge)](https://npmcharts.com/compare/sssx?minimal=true)
[![GitHub watchers](https://img.shields.io/github/watchers/sssx-dev/sssx.svg?style=for-the-badge)](https://github.com/sssx-dev/sssx/watchers)
[![GitHub stars](https://img.shields.io/github/stars/sssx-dev/sssx.svg?label=GitHub%20stars&style=for-the-badge)](https://github.com/sssx-dev/sssx/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/sssx-dev/sssx.svg?style=for-the-badge)](https://github.com/sssx-dev/sssx/network/members)
[![open bugs](https://img.shields.io/github/issues-raw/sssx-dev/sssx/bug.svg?color=d73a4a&label=open%20bugs&style=for-the-badge)](https://github.com/sssx-dev/sssx/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3Abug)
[![total open issues](https://img.shields.io/github/issues-raw/sssx-dev/sssx.svg?label=total%20open%20issues&style=for-the-badge)](https://github.com/sssx-dev/sssx/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr-raw/sssx-dev/sssx.svg?style=for-the-badge)](https://github.com/sssx-dev/sssx/pulls)

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

[YouTube demo](http://www.youtube.com/watch?v=8gNkKyfspl8)

[![IMAGE ALT TEXT](http://img.youtube.com/vi/8gNkKyfspl8/0.jpg)](http://www.youtube.com/watch?v=8gNkKyfspl8 'SSSX demo')

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

## Packages
- [x] [sssx](https://github.com/sssx-dev/sssx/tree/master/packages/sssx) main package
- [x] [eslint-config-sssx](https://github.com/sssx-dev/sssx/tree/master/packages/eslint-config-sssx) ESLint configuration
- [x] [@sssx/config](https://github.com/sssx-dev/sssx/tree/master/packages/config) Configuration parser and provider for SSSX
- [x] [@sssx/logger](https://github.com/sssx-dev/sssx/tree/master/packages/logger) SSSX specific logger
- [x] [@sssx/dev-server](https://github.com/sssx-dev/sssx/tree/master/packages/dev-server) A basic version of SSR dev server
- [x] [@sssx/sitemap-plugin](https://github.com/sssx-dev/sssx/tree/master/packages/sitemap-plugin) generates `robots.txt` and sitemaps
- [x] [@sssx/aws-adapter](https://github.com/sssx-dev/sssx/tree/master/packages/aws-adapter) uploads website content to S3 and refreshes CloudFront distribution for the changed URLs.

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

Copyright © 2022 [Eugene Hauptmann](https://twitter.com/sssx-dev)

[MIT](https://github.com/sssx-dev/sssx/blob/master/LICENSE)
