<script lang="ts">
  export let data: any = {};
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.description} />
  {#if data.keywords}<meta name="keywords" content={data.keywords} />{/if}
  {#if data.author}<meta name="author" content={data.author} />{/if}
</svelte:head>

<article class="prose lg:prose-xl">
  <header>
    <h1>{data.title}</h1>
    {#if data.author}
      <p class="author">By {data.author}</p>
    {/if}
    {#if data.date}
      <time datetime={data.date}>{data.date}</time>
    {/if}
    {#if data.tags}
      <div class="tags">
        {#each (Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(t => t.trim())) as tag}
          <span class="tag">{tag}</span>
        {/each}
      </div>
    {/if}
  </header>

  {@html data.html}

  {#if data._images && data._images.length > 0}
    <section class="images">
      <h3>Content Images</h3>
      {#each data._images as img}
        <img src={img.publicPath} alt={img.name} loading="lazy" decoding="async" />
      {/each}
    </section>
  {/if}
</article>

<style>
  .author {
    color: #6b7280;
    font-style: italic;
  }
  .tags {
    display: flex;
    gap: 0.5rem;
    margin: 0.5rem 0;
  }
  .tag {
    background: #e5e7eb;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
    color: #374151;
  }
  time {
    color: #9ca3af;
    font-size: 0.9rem;
  }
  .images img {
    max-width: 100%;
    border-radius: 8px;
    margin: 0.5rem 0;
  }
</style>
