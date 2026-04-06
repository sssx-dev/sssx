/**
 * Documentation site template for `sssx init --template docs`
 */
export const docsTemplate = {
  name: "docs",
  description: "Documentation site with sidebar navigation",

  config: `import type { Config } from "sssx";

const config: Config = {
  title: "{{name}} Docs",
  site: "https://example.com",
  assets: "public",
  rss: false,
  generate404: true,
};

export default config;
`,

  layout: `<script lang="ts">
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
</svelte:head>

<div class="layout">
  <aside>
    <h3>{{name}}</h3>
    <nav>
      <a href="/">Introduction</a>
      <a href="/getting-started/">Getting Started</a>
      <a href="/configuration/">Configuration</a>
      <a href="/about/">About</a>
    </nav>
  </aside>
  <main>
    <slot />
  </main>
</div>

<style>
  :global(body) {
    font-family: system-ui, -apple-system, sans-serif;
    margin: 0;
    color: #1a1a1a;
    line-height: 1.7;
  }
  .layout {
    display: grid;
    grid-template-columns: 250px 1fr;
    min-height: 100vh;
  }
  aside {
    padding: 2rem;
    border-right: 1px solid #e5e7eb;
    background: #f9fafb;
  }
  aside h3 { margin-top: 0; color: #3b82f6; }
  aside nav { display: flex; flex-direction: column; gap: 0.5rem; }
  aside a { color: #374151; text-decoration: none; padding: 0.25rem 0; }
  aside a:hover { color: #3b82f6; }
  main {
    max-width: 48rem;
    padding: 2rem;
  }
  @media (max-width: 768px) {
    .layout { grid-template-columns: 1fr; }
    aside { border-right: none; border-bottom: 1px solid #e5e7eb; }
  }
</style>
`,

  indexPage: `<script lang="ts">
  export let data: any = {};
</script>

<svelte:head>
  <title>{{name}} — Documentation</title>
</svelte:head>

<h1>{{name}}</h1>
<p>Welcome to the documentation.</p>

<h2>Quick Start</h2>
<pre><code>npm install {{name}}
npx {{name}} init</code></pre>
`,

  gettingStartedPage: `<script lang="ts">
  export let data: any = {};
</script>

<svelte:head>
  <title>Getting Started — {{name}}</title>
</svelte:head>

<h1>Getting Started</h1>
<p>Follow these steps to set up your project.</p>

<h2>Installation</h2>
<pre><code>npm install -g sssx</code></pre>

<h2>Create a project</h2>
<pre><code>sssx init my-docs --template docs</code></pre>
`,
};
