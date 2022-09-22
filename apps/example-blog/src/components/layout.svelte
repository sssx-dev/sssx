<script lang="ts">
  import '../styles/layout.css';
  import '../styles/globals.css';
  export let year = new Date().getFullYear();

  export let title: string = '';
  export let description: string = '';
  export let image: string = '';
  export let logo: string = '';
  export let keywords: string[] = [];

  const origin = `https://sssx.github.io`;
  const viewport = `width=device-width, maximum-scale=1.0, minimum-scale=1.0, initial-scale=1.0`;
  const tileColor = `#000000`;
  const themeColor = `#000000`;
  const twitterSite = `@sssxdev`;
  const twitterCreator = `@eugenehp`;
</script>

<svelte:head>
  <title>{title}</title>
  <link href="{origin}" rel="canonical" />
  <meta name="keywords" content="{keywords.join(',')}" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{description}" />
  <meta name="twitter:image" content="{image}" />
  <meta name="twitter:image:alt" content="{title}" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:image" content="{image}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="{twitterSite}" />
  <meta name="twitter:creator" content="{twitterCreator}" />
  <meta property="og:site_name" content="{origin}" />
  <meta property="og:type" content="website" />
  <link rel="icon" href="{logo}" sizes="any" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="{logo}" sizes="180x180" type="image/svg+xml" />
  <meta name="msapplication-TileColor" content="{tileColor}" />
  <meta name="msapplication-TileImage" href="{logo}" />
  <meta name="theme-color" content="{themeColor}" />
  <meta name="viewport" content="{viewport}" />
</svelte:head>

<div class="container mx-auto">
  <slot />
</div>

<div class="bg-black text-white flex justify-center">
  Made with <a href="https://sssx.dev/" rel="dofollow">SSSX</a> © {year}
</div>
