<script lang="ts">
  /**
   * <JsonLD> component for embedding JSON-LD structured data.
   *
   * Usage:
   *   <JsonLD schema={{ "@type": "Article", headline: "My Post" }} />
   */
  export let schema: Record<string, any> = {};

  $: fullSchema = { "@context": "https://schema.org", ...schema };
</script>

<svelte:head>
  <script type="application/ld+json">
    {JSON.stringify(fullSchema)}
  </script>
</svelte:head>
