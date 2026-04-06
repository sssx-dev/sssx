# Deployment

SSSX generates static HTML — deploy anywhere.

## Build

```shell
sssx build     # full build
sssx diff      # differential (only changed pages)
sssx cluster   # use all CPU cores
```

Output goes to `.sssx/` (configurable via `outDir`).

## Netlify

1. Build command: `npx sssx build`
2. Publish directory: `.sssx`
3. SSSX auto-generates `_headers` and `404.html`

```toml
# netlify.toml
[build]
  command = "npx sssx build"
  publish = ".sssx"
```

## Vercel

```json
{
  "buildCommand": "npx sssx build",
  "outputDirectory": ".sssx"
}
```

## Cloudflare Pages

1. Build command: `npx sssx build`
2. Build output directory: `.sssx`
3. `_headers` file is automatically served

## GitHub Pages

```yaml
# .github/workflows/deploy.yml
- run: npx sssx build
- uses: peaceiris/actions-gh-pages@v3
  with:
    publish_dir: .sssx
```

## Docker / Self-hosted

```shell
sssx build
sssx serve --port 8080
```

Or use any static file server:

```shell
npx serve .sssx
```

## Generated files

| File | Purpose |
|------|---------|
| `sitemap.xml` | Search engine indexing |
| `robots.txt` | Crawler rules + sitemap reference |
| `rss.xml` | RSS feed for content |
| `404.html` | Custom 404 page |
| `_headers` | Netlify/Cloudflare caching + security headers |
| `build-manifest.json` | Build metadata for CI/CD pipelines |
| `_assets/` | Content-hashed JS/CSS bundles (immutable) |
| `_images.json` | Image pipeline manifest |

## Performance

SSSX builds at ~20ms/page. Benchmarks:

| Pages | Time | Per page |
|-------|------|----------|
| 27 | 1.1s | 40ms |
| 517 | 11s | 21ms |
| 1000+ | ~20s | ~20ms |

Use `sssx cluster` for multi-core builds on large sites.
Use `sssx diff` for incremental builds that only rebuild changed pages.
