<script type="ts">
  import type { GetDataType } from 'sssx';
  import type { data as DataFunction } from './route.js';

  import First from '../../components/first.svelte';
  import Layout from '../../components/layout.svelte';

  import '../../styles/globals.css';

  export let data: GetDataType<typeof DataFunction>;
</script>

<h1>Title {data.title}</h1>

<Layout>
  <First hello="yo">Welcome to blog post</First>
</Layout>
