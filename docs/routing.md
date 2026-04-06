# Routing

SSSX supports three types of routes:

## 1. Plain routes

Static pages defined by `+page.svelte` files:

```
src/pages/+page.svelte           → /
src/pages/about/+page.svelte     → /about/
src/pages/contact/+page.svelte   → /contact/
```

## 2. Filesystem (dynamic) routes

Routes with parameters, defined by `+page.ts` + `+page.svelte`:

```
src/pages/[slug]/+page.ts        → /hello/, /world/, etc.
src/pages/[slug]/+page.svelte
```

The `+page.ts` must export `all()` and `request()`:

```ts
// +page.ts
export const all = () => [
  { slug: "hello" },
  { slug: "world" },
];

export const request = (param: { slug: string }) => ({
  ...param,
  title: `Page: ${param.slug}`,
});
```

### Route groups

Folders starting with `(` are ignored in the URL:

```
src/pages/(blog)/[slug]/+page.svelte  → /hello/ (not /blog/hello/)
```

## 3. Content routes

Markdown files in `src/content/` with frontmatter:

```markdown
---
title: Hello World
description: My first post
template: ./templates/post.svelte
date: 2024-01-01
tags: hello, first
---

Content here...
```

### Localized content

Place locale-specific files in a folder:

```
src/content/posts/hello/
  en-US.md       → /posts/hello/
  de-DE.md       → /de-DE/posts/hello/
  en-US.json     → merged into en-US props
```

### JSON data files

Place `.json` files next to content for extra data:

```
src/content/posts/
  data.json       → shared across all posts (author, template, etc.)
  hello.json      → specific to hello.md
  hello/
    en-US.json    → specific to en-US locale of hello
```

Merge precedence: `shared data.json` < `file.json` < `locale.json` < **frontmatter** (wins)

## Pagination

Use the `paginate()` helper in `+page.ts`:

```ts
import { paginate } from "sssx";

export const all = () => {
  const posts = getAllPosts(); // your data source
  return paginate(posts, { pageSize: 10, prefix: "/blog" });
};
```

This generates `/blog/`, `/blog/page/2/`, `/blog/page/3/`, etc.

## Taxonomy pages

Use `taxonomyPages()` to generate tag/category pages:

```ts
import { taxonomyPages } from "sssx";

export const all = () => {
  const posts = getAllPosts();
  return taxonomyPages(posts, "tags", { prefix: "/tags" });
};
```

This generates `/tags/javascript/`, `/tags/svelte/`, etc.
