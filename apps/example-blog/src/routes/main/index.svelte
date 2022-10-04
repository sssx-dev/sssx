<script type="ts">
  import { config } from '@sssx/config';
  export let title: string = '';
  export let requests: any[] = [];
  export let links: string[] = [];
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<h1>{title}</h1>

<h2>Welcome to the main page</h2>

<h2>Links inside dates</h2>
{#if requests.length > 0}
  <ol>
    {#each requests as r, i}
      <li>
        <a target="_blank" href="{links[i]}">
          {r && r.title ? r.title : ''}
        </a>
      </li>
    {/each}
  </ol>
{/if}

<footer>Made with <a href="{config.origin}" target="_blank">SSSX</a></footer>
