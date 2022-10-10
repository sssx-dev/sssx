<script type="ts">
  import type { Request } from 'sssx';
  import Meta from '../../components/meta.svelte';
  import First from '../../components/first.svelte';
  import Second from '../../components/second.svelte';

  import type { data as DataFunction } from './route.js';
  type Data = Awaited<ReturnType<typeof DataFunction>>;

  export let request: Request;
  export let data: Data;
</script>

<Meta request="{request}" />

<h1>Hello, your answer is {data.answer}</h1>

<Second hydrate-options="{{ preload: true }}" hello="static variable" />

<hr />
<First hello="static first world">Static slot</First>
<hr />

<h2>Second section</h2>
<Second hydrate-options="{{ preload: true }}" hello="static variable #2">
  <p>This is slot's content</p>
</Second>
