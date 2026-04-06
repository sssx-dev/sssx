# Images

## In Svelte pages

Import images directly — they get content-hashed:

```svelte
<script>
  import hero from "./hero.jpg";           // copied to route output
  import logo from "./logo.png?global";    // copied to global/ with hash
</script>

<img src={hero} alt="Hero" />
<img src={logo} alt="Logo" />
```

The `?global` suffix shares the image across all routes with a content-hashed filename.

## In markdown

Images in markdown are automatically processed by the image pipeline:

```markdown
![Photo](./photo.jpg)
```

If the image pipeline is active, `./photo.jpg` is rewritten to its content-hashed path.

## Image pipeline

During build, SSSX scans `src/content/` for images and:

1. Copies them to `global/images/` with content-hashed filenames
2. Generates `_images.json` manifest
3. Attaches route-specific images to `data._images` in templates

### Using `_images` in templates

```svelte
{#if data._images}
  {#each data._images as img}
    <img src={img.publicPath} alt={img.name} loading="lazy" />
  {/each}
{/if}
```

### Image utilities

```ts
import { responsiveImage, pictureElement, copyImageHashed } from "sssx";

// Generate <img> tag with lazy loading
const html = responsiveImage("/img/hero.jpg", "Hero image");

// Generate <picture> with format sources
const picture = pictureElement("/img/hero.jpg", "Hero", [
  { src: "/img/hero.webp", type: "image/webp" },
]);

// Copy with content hash
const publicPath = copyImageHashed("./hero.jpg", outdir, "global");
```

## `<Image>` component

```svelte
<script>
  import Image from "sssx/components/Image.svelte";
</script>

<Image src="/img/hero.jpg" alt="Hero" width={800} height={600} />
<Image src="/img/hero.jpg" alt="Hero" eager />  <!-- no lazy loading -->
```
