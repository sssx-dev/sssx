<script lang="ts">
  // TODO: add the dynamic types like in SvelteKit
  export let data: any = {};

  const { dog } = data;
</script>

<h1>
  This is the page about the dog {dog}
</h1>
