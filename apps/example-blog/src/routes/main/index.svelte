<script type="ts">
  import { config } from '@sssx/config';
  import type { GetDataType } from 'sssx';
  import type { data as DataFunction } from './route.js';

  export let data: GetDataType<typeof DataFunction>;
</script>

<svelte:head>
  <title>{data.title}</title>
</svelte:head>

<h1>{data.title}</h1>

<h2>Welcome to the example blog page</h2>

<code>
  {JSON.stringify(data, null, 2)}
</code>

<h2>Links inside dates</h2>
{#if data.routes.length > 0}
  <ol>
    {#each data.routes as route}
      <li>
        <a target="_blank" href="{route && route.path ? route.path : ''}">
          {route && route.request ? route.request.slug : ''}
        </a>
      </li>
    {/each}
  </ol>
{/if}

<footer>Made with <a href="{config.origin}" target="_blank">SSSX</a></footer>
