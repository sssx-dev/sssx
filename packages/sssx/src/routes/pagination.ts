import { type RouteInfo } from "./types.ts";

/**
 * Pagination helper for generating paginated route sets.
 *
 * Usage in +page.ts:
 *   import { paginate } from 'sssx';
 *   export const all = () => paginate(allPosts, { pageSize: 10, prefix: '/blog' });
 */

export interface PaginationOptions {
  /** Number of items per page */
  pageSize?: number;
  /** URL prefix, e.g. '/blog' */
  prefix: string;
  /** Template path for paginated pages */
  template?: string;
}

export interface PaginatedPage<T = any> {
  /** Items on this page */
  items: T[];
  /** Current page number (1-indexed) */
  page: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Items per page */
  pageSize: number;
  /** Permalink for this page */
  permalink: string;
  /** Previous page permalink (null for first) */
  prevPage: string | null;
  /** Next page permalink (null for last) */
  nextPage: string | null;
  /** Is first page */
  isFirst: boolean;
  /** Is last page */
  isLast: boolean;
  /** All page permalinks */
  pages: string[];
}

/**
 * Generate paginated params for use in +page.ts `all()`.
 * Returns an array of param objects, one per page.
 */
export const paginate = <T>(
  items: T[],
  options: PaginationOptions
): PaginatedPage<T>[] => {
  const pageSize = options.pageSize || 10;
  const prefix = options.prefix.replace(/\/+$/, "");
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const pages: string[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i === 1 ? `${prefix}/` : `${prefix}/page/${i}/`);
  }

  const result: PaginatedPage<T>[] = [];

  for (let i = 0; i < totalPages; i++) {
    const page = i + 1;
    const start = i * pageSize;
    const pageItems = items.slice(start, start + pageSize);
    const permalink = pages[i];

    result.push({
      items: pageItems,
      page,
      totalPages,
      totalItems: items.length,
      pageSize,
      permalink,
      prevPage: i > 0 ? pages[i - 1] : null,
      nextPage: i < totalPages - 1 ? pages[i + 1] : null,
      isFirst: i === 0,
      isLast: i === totalPages - 1,
      pages,
    });
  }

  return result;
};

/**
 * Generate taxonomy index pages (e.g., /tags/javascript/).
 * Returns params suitable for use in +page.ts.
 */
export interface TaxonomyPage<T = any> {
  /** Taxonomy name (e.g., "tags") */
  taxonomy: string;
  /** Taxonomy value (e.g., "javascript") */
  value: string;
  /** Items matching this taxonomy value */
  items: T[];
  /** Count of items */
  count: number;
  /** Permalink for this taxonomy page */
  permalink: string;
}

export const taxonomyPages = <T extends { param?: Record<string, any> }>(
  items: T[],
  taxonomy: string,
  options: { prefix?: string } = {}
): TaxonomyPage<T>[] => {
  const prefix = (options.prefix || `/${taxonomy}`).replace(/\/+$/, "");
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const param = (item as any).param || item;
    const values = param[taxonomy];
    if (!values) continue;

    const tags = Array.isArray(values)
      ? values
      : String(values).split(",").map((v: string) => v.trim());

    for (const tag of tags) {
      if (!tag) continue;
      if (!groups.has(tag)) groups.set(tag, []);
      groups.get(tag)!.push(item);
    }
  }

  const result: TaxonomyPage<T>[] = [];
  for (const [value, groupItems] of groups) {
    const slug = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    result.push({
      taxonomy,
      value,
      items: groupItems,
      count: groupItems.length,
      permalink: `${prefix}/${slug}/`,
    });
  }

  return result.sort((a, b) => b.count - a.count);
};
