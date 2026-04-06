# SEO

SSSX generates comprehensive SEO output automatically.

## Auto-generated per page

| Feature | Source | Output |
|---------|--------|--------|
| `<title>` | Frontmatter `title` or Svelte `<svelte:head>` | `<title>` tag |
| Meta description | Frontmatter `description` | `<meta name="description">` |
| Keywords | Frontmatter `keywords` | `<meta name="keywords">` |
| Canonical URL | `config.site` + permalink | `<link rel="canonical">` |
| Open Graph | Frontmatter `title`, `description`, `image` | `og:title`, `og:description`, etc. |
| Twitter Card | Same as OG | `twitter:card`, `twitter:title`, etc. |
| JSON-LD | Route type + frontmatter | `<script type="application/ld+json">` |
| hreflang | Multi-locale content | `<link rel="alternate" hreflang="...">` |
| Generator | Package version | `<meta name="generator">` |

## Auto-generated per build

| File | Description |
|------|-------------|
| `sitemap.xml` | Sitemap index with sub-sitemaps (5000 URLs each), includes hreflang |
| `robots.txt` | With sitemap reference |
| `rss.xml` | RSS 2.0 feed from content routes with dates |
| `404.html` | Styled 404 page for static hosts |
| `_headers` | Cache/security headers for Netlify/Cloudflare |
| `build-manifest.json` | Build metadata for CI/CD |

## Svelte components

Import SEO components in your pages:

```svelte
<script>
  import SEO from "sssx/components/SEO.svelte";
  import JsonLD from "sssx/components/JsonLD.svelte";
  import Image from "sssx/components/Image.svelte";
</script>

<SEO
  title="My Page"
  description="Page description"
  image="/img/hero.jpg"
  url="https://example.com/my-page/"
/>

<JsonLD schema={{
  "@type": "Article",
  headline: "My Article",
  datePublished: "2024-01-01"
}} />

<Image src="/img/photo.jpg" alt="Photo" width={800} height={600} />
```

## Frontmatter for SEO

```yaml
---
title: My Post
description: A great post about things
keywords: post, things, great
image: /img/hero.jpg
author: John Doe
date: 2024-01-01
updated: 2024-06-01
tags: javascript, svelte
---
```

All frontmatter fields are automatically used for OG, Twitter, JSON-LD, and RSS.
