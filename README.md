# SSSX

[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/sssxdev.svg?style=social&label=Follow%20%40sssxdev)](https://twitter.com/sssxdev)
[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/eugenehp.svg?style=social&label=Follow%20%40eugenehp)](https://twitter.com/eugenehp)
[![Youtube URL](https://shields.io/badge/views-1k-red?logo=youtube&style=social)](https://www.youtube.com/channel/UCYzzLilEQdBG0Jj1JhVtYYg)

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

Fast Svelte Static Site X – SSG/SSR focused on SEO for multi-million pages websites

This framework is built to deliver fast generation of millions of pages and reduce deployment costs, while providing great development experience.

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

[![IMAGE ALT TEXT](http://img.youtube.com/vi/8gNkKyfspl8/0.jpg)](http://www.youtube.com/watch?v=8gNkKyfspl8 "SSSX demo")

## Overview

Why another SSG?

This project was created from the need to manage sites with millions of pages, with making static site generation a primary use case, and SEO optimisation its first goal.

## Philosophy

This framework was created to address several things that are lacking in current frameworks:

1. SEO first
2. Links and URLs first
3. Designed for websites with millions of pages

## Features

- 🦕 First-class Deno support
- 📈 Incremental updates `sssx build <url>`.
- 🚀 It's fast! 1000ms or less spent on building each page.
- 👍 Each page is it's own SPA. Fully autonomous.
- 💦 Hydration using Svelte components.
- 📦 Small size of JavaScript overhead, thanks to Svelte.
- 💪 ESM first, no more enormous CommonJS bundles, thanks to Esbuild.
- 🕸️ Out of box SEO features: metatags, i18n, web vitals, robots, sitemap, etc.
- 🏠 Host anywhere. It's just HTML files with bunch of CSS and JS files.
- ⚡️ You can generate one URL or millions. No need to rebuild whole website each time.
- 😎 Development Experience is our priority!

## Cluster mode

To run SSSX in cluster mode to use all available CPU cores use the following command:

```shell
sssx cluster
```

Here's a demonstration of generating 1000+ URLs under 30 seconds:

![1000 urls in cluster mode in real time](https://github.com/sssx-dev/sssx/raw/master/docs/cluster-1000-urls.gif)

## Documentation

When you render millions of static pages, you don't want to rerender all of them each time.
SSSX enables you to finetune which pages has to be updated and when.

## Structure

This repository is structured as a monorepo and uses workspaces.

## Packages

- [x] [sssx](https://github.com/sssx-dev/sssx/tree/master/packages/sssx) main package
- [x] [example](https://github.com/sssx-dev/sssx/tree/master/packages/example) Example website project built with SSSX

## Getting started

To run an example project use the following:

```shell
cd apps/example-blog
npm install
npx sssx dev open
```

Run build cluster using deno:

```shell
deno \
    --allow-read \
    --allow-env \
    --allow-sys \
    --allow-write \
    --allow-run \
    ../../node_modules/.bin/sssx cluster
```

## Development

```shell
cd packages/example
../sssx/src/cli.ts dev open
```

### Helper URL

[/\_\_debug](http://127.0.0.1:8080/__debug/) you can access `__debug` page to see all existing routes. It only works in `dev` mode.

## Thank you

Inspirations are drawn from:

- [Next.js](https://github.com/vercel/next.js/)
- [Elder.js](https://github.com/Elderjs/elderjs)
- [SvelteKit](https://github.com/sveltejs/kit)
- [Astro](https://github.com/withastro/astro)
- [Esbuild](https://github.com/evanw/esbuild)
- [Rust](https://github.com/rust-lang/rust)

## License

Copyright © 2022-2024 [Eugene Hauptmann](https://twitter.com/sssx-dev)

[MIT](https://github.com/sssx-dev/sssx/blob/master/LICENSE)
