import { type ImageMap } from "./imagePipeline.ts";
import { visit } from "unist-util-visit";

/**
 * Rehype plugin that rewrites image src paths in markdown
 * to use content-hashed paths from the image pipeline.
 *
 * Usage in sssx.config.ts:
 *   import { rehypeRewriteImages } from 'sssx';
 *   rehypePlugins: [rehypeRewriteImages(imageMap)]
 *
 * Or automatically applied during build if imageMap is available.
 */

export const rehypeRewriteImages = (imageMap: ImageMap) => {
  return () => {
    return (tree: any) => {
      visit(tree, "element", (node: any) => {
        if (node.tagName === "img" && node.properties?.src) {
          const src = node.properties.src;

          // Skip external URLs
          if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//")) {
            return;
          }

          // Try to resolve from image map
          const resolved = resolveFromMap(src, imageMap);
          if (resolved) {
            node.properties.src = resolved;
          }

          // Add lazy loading if not present
          if (!node.properties.loading) {
            node.properties.loading = "lazy";
          }
          if (!node.properties.decoding) {
            node.properties.decoding = "async";
          }
        }
      });
    };
  };
};

function resolveFromMap(src: string, imageMap: ImageMap): string | undefined {
  // Normalize the path
  const normalized = src.replace(/^\.\//, "").replace(/^\//, "");

  for (const [key, entry] of Object.entries(imageMap.images)) {
    const normalizedKey = key.replace(/^\//, "");
    if (normalizedKey.endsWith(normalized) || normalized.endsWith(normalizedKey)) {
      return entry.publicPath;
    }
    // Match by filename only
    const srcFilename = normalized.split("/").pop();
    const keyFilename = normalizedKey.split("/").pop();
    if (srcFilename && keyFilename && srcFilename === keyFilename) {
      return entry.publicPath;
    }
  }

  return undefined;
}
