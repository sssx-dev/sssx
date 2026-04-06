/**
 * Portfolio template for `sssx init --template portfolio`
 */
export const portfolioTemplate = {
  name: "portfolio",
  description: "Personal portfolio with projects and about page",

  config: `import type { Config } from "sssx";

const config: Config = {
  title: "{{name}}",
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

<header>
  <nav>
    <a href="/" class="logo">{{name}}</a>
    <div>
      <a href="/">Work</a>
      <a href="/about/">About</a>
    </div>
  </nav>
</header>

<main>
  <slot />
</main>

<style>
  :global(body) {
    font-family: system-ui, -apple-system, sans-serif;
    margin: 0;
    color: #1a1a1a;
  }
  header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e5e7eb;
  }
  nav {
    max-width: 64rem;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  nav div { display: flex; gap: 1.5rem; }
  .logo { font-weight: 700; font-size: 1.25rem; color: #1a1a1a; text-decoration: none; }
  nav a { color: #6b7280; text-decoration: none; }
  nav a:hover { color: #1a1a1a; }
  main {
    max-width: 64rem;
    margin: 3rem auto;
    padding: 0 2rem;
  }
</style>
`,

  indexPage: `<script lang="ts">
  export let data: any = {};
</script>

<svelte:head>
  <title>{{name}} — Portfolio</title>
  <meta name="description" content="Portfolio of {{name}}" />
</svelte:head>

<section class="hero">
  <h1>Hi, I'm {{name}}</h1>
  <p>I build things for the web.</p>
</section>

<section class="projects">
  <h2>Projects</h2>
  <div class="grid">
    <div class="card">
      <h3>Project One</h3>
      <p>Description of your first project.</p>
    </div>
    <div class="card">
      <h3>Project Two</h3>
      <p>Description of your second project.</p>
    </div>
  </div>
</section>

<style>
  .hero { margin-bottom: 4rem; }
  .hero h1 { font-size: 3rem; margin-bottom: 0.5rem; }
  .hero p { font-size: 1.25rem; color: #6b7280; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
  .card { padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 8px; }
  .card:hover { border-color: #3b82f6; }
  .card h3 { margin-top: 0; }
</style>
`,

  aboutPage: `<script lang="ts">
  export let data: any = {};
</script>

<svelte:head>
  <title>About — {{name}}</title>
</svelte:head>

<h1>About Me</h1>
<p>Tell visitors about yourself. This page is at <code>src/pages/about/+page.svelte</code>.</p>
<a href="/">← Back to work</a>
`,
};
