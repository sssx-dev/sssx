import { type Config } from "../config.ts";
import { type RouteInfo } from "../routes/types.ts";
import { cleanURL } from "../utils/cleanURL.ts";

/**
 * Generate JSON-LD structured data for a route.
 * Returns a <script type="application/ld+json"> tag.
 */
export const generateJsonLD = (
  segment: RouteInfo,
  config: Config,
  site?: string
): string => {
  const p = segment.param || {};
  const url = site ? cleanURL(`${site}${segment.permalink}`) : undefined;

  // Determine schema type
  const isArticle = p.date || p.template || segment.type === "content";

  if (isArticle) {
    const schema: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: p.title || config.title || "",
      url,
    };

    if (p.description) schema.description = p.description;
    if (p.image) {
      schema.image = p.image.startsWith("http")
        ? p.image
        : site
          ? cleanURL(`${site}${p.image}`)
          : p.image;
    }
    if (p.date) schema.datePublished = p.date;
    if (p.updated) schema.dateModified = p.updated;
    if (p.author) {
      schema.author = {
        "@type": "Person",
        name: p.author,
      };
    }

    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  }

  // Default: WebPage
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: p.title || config.title || "",
    url,
  };

  if (p.description) schema.description = p.description;

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
};
