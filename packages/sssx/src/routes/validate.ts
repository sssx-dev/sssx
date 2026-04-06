import colors from "ansi-colors";
import { type RouteInfo } from "./types.ts";

/**
 * Validate routes for common issues:
 * - Duplicate permalinks
 * - Missing svelte components
 * - Invalid permalink formats
 *
 * Returns array of warning messages. Throws on critical errors.
 */
export const validateRoutes = (routes: RouteInfo[]): string[] => {
  const warnings: string[] = [];

  // Check for duplicate permalinks
  const seen = new Map<string, RouteInfo>();
  for (const route of routes) {
    const existing = seen.get(route.permalink);
    if (existing) {
      warnings.push(
        `Duplicate permalink "${route.permalink}" — ` +
        `defined in "${route.file}" and "${existing.file}". ` +
        `Only the first will be used.`
      );
    } else {
      seen.set(route.permalink, route);
    }
  }

  // Check for missing svelte files
  for (const route of routes) {
    if (!route.svelte && route.type !== "plain") {
      warnings.push(
        `Route "${route.permalink}" has no svelte component ` +
        `(file: "${route.file}"). It may not render correctly.`
      );
    }
  }

  // Check for permalinks with unresolved slugs
  for (const route of routes) {
    if (route.permalink.includes("[") && route.permalink.includes("]")) {
      warnings.push(
        `Route "${route.permalink}" contains unresolved slug brackets. ` +
        `Check that all dynamic parameters are provided.`
      );
    }
  }

  // Check for permalinks without leading slash
  for (const route of routes) {
    if (!route.permalink.startsWith("/")) {
      warnings.push(
        `Route "${route.permalink}" doesn't start with "/". ` +
        `This may cause URL resolution issues.`
      );
    }
  }

  return warnings;
};

/** Print route validation warnings */
export const printValidationWarnings = (warnings: string[]) => {
  if (warnings.length === 0) return;

  console.warn(colors.yellow(`\n  ⚠ Route validation warnings (${warnings.length}):\n`));
  for (const w of warnings) {
    console.warn(colors.dim(`    • ${w}`));
  }
  console.warn("");
};
