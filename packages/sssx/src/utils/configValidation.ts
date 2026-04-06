import colors from "ansi-colors";
import { type Config } from "../config.ts";

const { yellow, dim } = colors;

const KNOWN_KEYS = new Set([
  "title",
  "assets",
  "outDir",
  "site",
  "baseDir",
  "rehypePlugins",
  "defaultLocale",
  "globalDir",
  "writeURLsIndex",
  "writeFilesIndex",
  "plugins",
  "theme",
  "minify",
  "rss",
  "generate404",
]);

/**
 * Validate sssx.config.ts and warn about unknown keys, missing values, etc.
 */
export const validateConfig = (config: Config): string[] => {
  const warnings: string[] = [];

  // Check for unknown keys
  for (const key of Object.keys(config)) {
    if (!KNOWN_KEYS.has(key)) {
      warnings.push(`Unknown config key "${key}". Did you mean one of: ${[...KNOWN_KEYS].join(", ")}?`);
    }
  }

  // Check site URL format
  if (config.site) {
    if (!config.site.startsWith("http://") && !config.site.startsWith("https://")) {
      warnings.push(`"site" should start with http:// or https:// (got "${config.site}")`);
    }
    if (!config.site.endsWith("/")) {
      warnings.push(`"site" should end with a trailing slash (got "${config.site}")`);
    }
  }

  // Check locale format
  if (config.defaultLocale) {
    if (!config.defaultLocale.match(/^[a-z]{2}(-[A-Z]{2})?$/)) {
      warnings.push(`"defaultLocale" should be a BCP-47 tag like "en-US" (got "${config.defaultLocale}")`);
    }
  }

  // Check outDir doesn't conflict
  if (config.outDir && (config.outDir === "src" || config.outDir === "public")) {
    warnings.push(`"outDir" is set to "${config.outDir}" which conflicts with source directories`);
  }

  return warnings;
};

/** Print config validation warnings */
export const printConfigWarnings = (warnings: string[]) => {
  if (warnings.length === 0) return;
  console.warn(yellow(`\n  ⚠ Config warnings (${warnings.length}):\n`));
  for (const w of warnings) {
    console.warn(dim(`    • ${w}`));
  }
  console.warn("");
};
