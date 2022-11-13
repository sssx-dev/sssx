<script type="ts">
  import type { GetDataType } from 'sssx';
  import type { data as DataFunction } from './route.js';

  export let data: GetDataType<typeof DataFunction>;
</script>

<h1>Title {data.title}</h1>
<p>{data.description}</p>

{@html data.html}
