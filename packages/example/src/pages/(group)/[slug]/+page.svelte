<script lang="ts">
  // TODO: add the dynamic types like in SvelteKit
  export let data: any = {};

  const { slug } = data;
</script>

<h1>
  This is the page about the slug {slug}
</h1>
