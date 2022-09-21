<script type="ts">
  export let title: string = '';
  export let testBlogSlug: string = '';
  export let requests: any[] = [];
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<h1>{title}</h1>

<h2>Welcome to the main page</h2>

<h3>Generated blog slug is <a href="{testBlogSlug}">{testBlogSlug}</a></h3>

<h2>Links inside dates</h2>
<ul>
  {#each requests as r}
    <li>
      <a target="_blank" href="{r.slug}">
        {r.title}
      </a>
    </li>
  {/each}
</ul>

<footer>Made with <a href="https://github.com/sssx-dev/sssx" target="_blank">SSSX</a></footer>
