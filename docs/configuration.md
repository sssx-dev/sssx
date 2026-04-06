# Configuration

All configuration is in `sssx.config.ts` at the project root.

```ts
import type { Config } from "sssx";

const config: Config = {
  // Site title (used in SEO fallbacks)
  title: "My Site",

  // Full URL of deployed site (used for canonical URLs, sitemap, RSS)
  site: "https://example.com",

  // Public assets folder (copied to output root)
  assets: "public",      // default: "public"

  // Output directory
  outDir: ".sssx",        // default: ".sssx"

  // Base dir for subpath deployment (e.g., "/blog/")
  baseDir: undefined,

  // Default locale
  defaultLocale: "en-US", // default: "en-US"

  // Global assets directory name
  globalDir: "global",    // default: "global"

  // Minify JS/CSS in production
  minify: true,           // default: true

  // Generate RSS feed from content routes
  rss: true,              // default: true

  // Generate 404 page
  generate404: true,      // default: true

  // Dump route URLs to sssx.urls.ts
  writeURLsIndex: false,

  // Dump file list to sssx.files.ts
  writeFilesIndex: false,

  // Rehype plugins for markdown processing
  rehypePlugins: [],

  // SSSX plugins (lifecycle hooks)
  plugins: [],

  // Theme (path or theme object)
  theme: undefined,
};

export default config;
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `PORT` | Dev server port (default: 8080) |
