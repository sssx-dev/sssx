<script lang="ts">
  export let data: any = {};
  console.log("Inside post.template", data);
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.description} />
  <meta name="keywords" content={data.keywords} />
</svelte:head>

<article class="prose lg:prose-xl">
  {@html data.html}
</article>
