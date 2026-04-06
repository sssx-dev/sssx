# Getting Started

## Installation

```shell
npm install -g sssx
```

## Create a new project

```shell
sssx init my-blog --template blog
cd my-blog
npm install
npx sssx dev open
```

### Available templates

| Template | Description |
|----------|-------------|
| `blog` | Blog with posts, tags, RSS feed |
| `docs` | Documentation site with sidebar navigation |
| `portfolio` | Personal portfolio with project cards |

## Project structure

```
my-blog/
├── sssx.config.ts          # Site configuration
├── src/
│   ├── +layout.svelte      # Root layout (wraps all pages)
│   ├── pages/              # File-based routing
│   │   ├── +page.svelte    # / (home page)
│   │   ├── about/
│   │   │   └── +page.svelte  # /about/
│   │   └── [slug]/
│   │       ├── +page.ts    # Dynamic route data
│   │       └── +page.svelte  # Dynamic route template
│   ├── content/            # Markdown content
│   │   └── posts/
│   │       ├── data.json   # Shared data for all posts
│   │       └── hello.md    # Content page
│   └── templates/          # Svelte templates for content
│       └── post.svelte
└── public/                 # Static assets (copied as-is)
```

## Commands

```shell
sssx dev              # Development server with live reload
sssx dev --port 3000  # Custom port
sssx build            # Production build
sssx build /about/    # Build single URL
sssx diff             # Differential build (only changed pages)
sssx cluster          # Build using all CPU cores
sssx serve            # Serve production build locally
sssx urls             # List all routes
sssx urls --json      # Routes as JSON
sssx info             # Project info
sssx clean            # Remove generated files
sssx --version        # Show version
sssx --help           # Show help
```
