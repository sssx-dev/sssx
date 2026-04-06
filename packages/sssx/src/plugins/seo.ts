import { type Config } from "../config.ts";
import { type RouteInfo } from "../routes/types.ts";
import { cleanURL } from "../utils/cleanURL.ts";

export interface SEOMeta {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  date?: string;
  updated?: string;
  author?: string;
  locale?: string;
}

/**
 * Generate comprehensive SEO meta tags from route params and config.
 * Returns HTML string to inject into <head>.
 */
export const generateSEOHead = (
  segment: RouteInfo,
  config: Config,
  site?: string
): string => {
  const meta: SEOMeta = {
    ...segment.param,
    locale: segment.locale || config.defaultLocale,
  };

  const tags: string[] = [];
  const url = site ? cleanURL(`${site}${segment.permalink}`) : undefined;

  // Basic meta
  if (meta.description) {
    tags.push(`<meta name="description" content="${escapeAttr(meta.description)}" />`);
  }
  if (meta.keywords) {
    tags.push(`<meta name="keywords" content="${escapeAttr(meta.keywords)}" />`);
  }
  if (meta.author) {
    tags.push(`<meta name="author" content="${escapeAttr(meta.author)}" />`);
  }

  // Open Graph
  tags.push(`<meta property="og:type" content="${meta.type || "website"}" />`);
  if (meta.title) {
    tags.push(`<meta property="og:title" content="${escapeAttr(meta.title)}" />`);
  }
  if (meta.description) {
    tags.push(`<meta property="og:description" content="${escapeAttr(meta.description)}" />`);
  }
  if (url) {
    tags.push(`<meta property="og:url" content="${url}" />`);
  }
  if (meta.image) {
    const imgUrl = meta.image.startsWith("http")
      ? meta.image
      : site
        ? cleanURL(`${site}${meta.image}`)
        : meta.image;
    tags.push(`<meta property="og:image" content="${imgUrl}" />`);
  }
  if (meta.locale) {
    tags.push(`<meta property="og:locale" content="${meta.locale}" />`);
  }
  if (config.site) {
    tags.push(`<meta property="og:site_name" content="${config.title || ""}" />`);
  }

  // Article dates — normalize to ISO format
  if (meta.date) {
    const d = meta.date instanceof Date ? meta.date.toISOString() : String(meta.date);
    tags.push(`<meta property="article:published_time" content="${d}" />`);
  }
  if (meta.updated) {
    const d = meta.updated instanceof Date ? meta.updated.toISOString() : String(meta.updated);
    tags.push(`<meta property="article:modified_time" content="${d}" />`);
  }

  // Twitter Card
  tags.push(`<meta name="twitter:card" content="${meta.image ? "summary_large_image" : "summary"}" />`);
  if (meta.title) {
    tags.push(`<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`);
  }
  if (meta.description) {
    tags.push(`<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`);
  }
  if (meta.image) {
    const imgUrl = meta.image.startsWith("http")
      ? meta.image
      : site
        ? cleanURL(`${site}${meta.image}`)
        : meta.image;
    tags.push(`<meta name="twitter:image" content="${imgUrl}" />`);
  }

  // Canonical
  if (url) {
    tags.push(`<link rel="canonical" href="${url}" />`);
  }

  return tags.join("\n    ");
};

/** Escape HTML attribute values */
const escapeAttr = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};
