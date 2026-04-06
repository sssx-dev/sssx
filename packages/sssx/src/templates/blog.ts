/**
 * Blog starter template for `sssx init --template blog`
 */
export const blogTemplate = {
  name: "blog",
  description: "Blog with posts, tags, pagination, and RSS",

  config: `import type { Config } from "sssx";

const config: Config = {
  title: "{{name}}",
  site: "https://example.com",
  assets: "public",
  rss: true,
  generate404: true,
  minify: true,
};

export default config;
`,

  layout: `<script lang="ts">
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
</svelte:head>

<nav>
  <a href="/">Home</a>
  <a href="/about/">About</a>
</nav>

<main>
  <slot />
</main>

<footer>
  <p>&copy; {{year}} {{name}}</p>
</footer>

<style>
  :global(body) {
    font-family: system-ui, -apple-system, sans-serif;
    margin: 0;
    color: #1a1a1a;
    line-height: 1.7;
  }
  nav {
    padding: 1rem 2rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    gap: 1rem;
  }
  nav a {
    color: #3b82f6;
    text-decoration: none;
  }
  main {
    max-width: 48rem;
    margin: 2rem auto;
    padding: 0 1rem;
  }
  footer {
    text-align: center;
    padding: 2rem;
    color: #9ca3af;
    border-top: 1px solid #e5e7eb;
  }
</style>
`,

  indexPage: `<script lang="ts">
  export let data: any = {};
</script>

<svelte:head>
  <title>{{name}}</title>
  <meta name="description" content="Welcome to {{name}}" />
</svelte:head>

<h1>{{name}}</h1>
<p>Welcome to your new blog, built with <a href="https://sssx.dev">SSSX</a>.</p>

<h2>Recent Posts</h2>
<p>Add markdown files to <code>src/content/posts/</code> to get started.</p>
`,

  aboutPage: `<script lang="ts">
  export let data: any = {};
</script>

<svelte:head>
  <title>About — {{name}}</title>
</svelte:head>

<h1>About</h1>
<p>This blog is built with SSSX — the static site generator for millions of pages.</p>
<a href="/">← Back home</a>
`,

  postTemplate: `<script lang="ts">
  export let data: any = {};
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.description || ""} />
</svelte:head>

<article>
  <header>
    <h1>{data.title}</h1>
    {#if data.date}
      <time>{new Date(data.date).toLocaleDateString()}</time>
    {/if}
    {#if data.tags}
      <div class="tags">
        {#each (Array.isArray(data.tags) ? data.tags : String(data.tags).split(',').map(t => t.trim())) as tag}
          <span class="tag">{tag}</span>
        {/each}
      </div>
    {/if}
  </header>
  {@html data.html}
</article>

<style>
  article { max-width: 48rem; }
  time { color: #9ca3af; }
  .tags { display: flex; gap: 0.5rem; margin: 0.5rem 0; }
  .tag { background: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; }
</style>
`,

  samplePost: `---
title: Hello World
description: My first blog post
date: {{date}}
tags: hello, first-post
template: ./templates/post.svelte
---

# Hello World

This is your first blog post. Edit this file or create new ones in \`src/content/posts/\`.

## Features

- **Frontmatter** — title, description, date, and tags are automatically used for SEO
- **JSON data files** — add a \`data.json\` next to your posts for shared data
- **Image pipeline** — drop images next to your markdown, they get content-hashed
- **RSS feed** — automatically generated at \`/rss.xml\`
- **Differential builds** — run \`sssx diff\` to only rebuild changed pages
`,

  dataJson: `{
  "template": "./templates/post.svelte",
  "author": "{{name}}"
}
`,
};
