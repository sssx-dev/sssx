<script lang="ts">
  /**
   * <SEO> component for Svelte pages.
   * Generates meta tags, Open Graph, Twitter Card, and canonical URL.
   *
   * Usage:
   *   <SEO title="My Page" description="..." image="/img/hero.jpg" />
   */
  export let title: string = "";
  export let description: string = "";
  export let keywords: string = "";
  export let image: string = "";
  export let url: string = "";
  export let type: string = "website";
  export let author: string = "";
  export let date: string = "";
  export let updated: string = "";
  export let siteName: string = "";
  export let locale: string = "en_US";
  export let twitterCard: string = image ? "summary_large_image" : "summary";
  export let noindex: boolean = false;
</script>

<svelte:head>
  {#if title}<title>{title}</title>{/if}
  {#if description}<meta name="description" content={description} />{/if}
  {#if keywords}<meta name="keywords" content={keywords} />{/if}
  {#if author}<meta name="author" content={author} />{/if}
  {#if noindex}<meta name="robots" content="noindex, nofollow" />{/if}

  <!-- Open Graph -->
  <meta property="og:type" content={type} />
  {#if title}<meta property="og:title" content={title} />{/if}
  {#if description}<meta property="og:description" content={description} />{/if}
  {#if url}<meta property="og:url" content={url} />{/if}
  {#if image}<meta property="og:image" content={image} />{/if}
  {#if locale}<meta property="og:locale" content={locale} />{/if}
  {#if siteName}<meta property="og:site_name" content={siteName} />{/if}
  {#if date}<meta property="article:published_time" content={date} />{/if}
  {#if updated}<meta property="article:modified_time" content={updated} />{/if}

  <!-- Twitter Card -->
  <meta name="twitter:card" content={twitterCard} />
  {#if title}<meta name="twitter:title" content={title} />{/if}
  {#if description}<meta name="twitter:description" content={description} />{/if}
  {#if image}<meta name="twitter:image" content={image} />{/if}

  <!-- Canonical -->
  {#if url}<link rel="canonical" href={url} />{/if}
</svelte:head>
