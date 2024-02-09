<script lang="ts">
  import type { Props } from "./+page";

  export let data: Props;

  const { slug } = data;
</script>

<h1>
  This is the page about the slug {slug}
</h1>
