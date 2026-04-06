import { type RouteInfo } from "../routes/types.ts";
import colors from "ansi-colors";

/**
 * Filter content routes based on draft status and scheduled dates.
 *
 * Frontmatter fields:
 * - `draft: true` — excluded from production builds
 * - `date: 2025-01-01` — excluded if date is in the future (scheduled)
 * - `publishAt: 2025-01-01T10:00:00Z` — more precise scheduling
 * - `expiresAt: 2024-12-31` — excluded if date is in the past
 */

export interface FilterResult {
  included: RouteInfo[];
  drafts: RouteInfo[];
  scheduled: RouteInfo[];
  expired: RouteInfo[];
}

export const filterContentRoutes = (
  routes: RouteInfo[],
  isDev: boolean = false
): FilterResult => {
  const now = new Date();
  const included: RouteInfo[] = [];
  const drafts: RouteInfo[] = [];
  const scheduled: RouteInfo[] = [];
  const expired: RouteInfo[] = [];

  for (const route of routes) {
    const p = route.param || {};

    // Draft detection
    if (p.draft === true) {
      if (isDev) {
        // In dev, include drafts but mark them
        route.param = { ...p, _isDraft: true };
        included.push(route);
      }
      drafts.push(route);
      continue;
    }

    // Scheduled content (publishAt or future date)
    const publishAt = p.publishAt ? new Date(p.publishAt) : null;
    if (publishAt && publishAt > now && !isDev) {
      scheduled.push(route);
      continue;
    }

    // Expired content
    const expiresAt = p.expiresAt ? new Date(p.expiresAt) : null;
    if (expiresAt && expiresAt < now && !isDev) {
      expired.push(route);
      continue;
    }

    included.push(route);
  }

  return { included, drafts, scheduled, expired };
};

/** Print filter stats */
export const printFilterStats = (result: FilterResult) => {
  const { dim, yellow } = colors;
  if (result.drafts.length > 0) {
    console.log(dim(`  ${yellow("⊘")} ${result.drafts.length} draft(s) excluded`));
  }
  if (result.scheduled.length > 0) {
    console.log(dim(`  ${yellow("⏱")} ${result.scheduled.length} scheduled (future date)`));
  }
  if (result.expired.length > 0) {
    console.log(dim(`  ${yellow("⏰")} ${result.expired.length} expired`));
  }
};
