import fs from "node:fs";
import path from "node:path";
import { globby } from "globby";
import { type Config } from "../config.ts";
import { globEscape } from "../utils/globEscape.ts";

/**
 * Load JSON data files alongside content files.
 *
 * Supports two patterns:
 *
 * 1. Single locale JSON next to markdown:
 *    src/content/posts/hello.md
 *    src/content/posts/hello.json       → merged into props
 *
 * 2. Locale-specific JSON in a folder:
 *    src/content/posts/hello/en-US.md
 *    src/content/posts/hello/en-US.json  → merged for en-US
 *    src/content/posts/hello/data.json   → shared across all locales
 *
 * 3. Shared data.json at folder level:
 *    src/content/posts/data.json         → merged into all posts/* routes
 *
 * JSON data is deep-merged into route params (frontmatter values take precedence).
 */

export interface JsonDataResult {
  /** Shared data from data.json files in parent directories */
  shared: Record<string, any>;
  /** Locale-specific data from <locale>.json */
  localeData: Record<string, any>;
  /** File-specific data from <name>.json */
  fileData: Record<string, any>;
}

/**
 * Load all applicable JSON data for a content file.
 */
export const loadJsonData = (
  contentFile: string,
  locale: string,
  config: Config
): JsonDataResult => {
  const dir = path.dirname(contentFile);
  const basename = path.basename(contentFile, path.extname(contentFile));

  const result: JsonDataResult = {
    shared: {},
    localeData: {},
    fileData: {},
  };

  // 1. Shared data.json in same directory
  const sharedPath = path.join(dir, "data.json");
  if (fs.existsSync(sharedPath)) {
    result.shared = safeLoadJson(sharedPath);
  }

  // 2. Walk up parent directories for data.json (up to src/content)
  let current = path.dirname(dir);
  while (current.includes("content")) {
    const parentData = path.join(current, "data.json");
    if (fs.existsSync(parentData)) {
      // Parent data has lower precedence
      result.shared = { ...safeLoadJson(parentData), ...result.shared };
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  // 3. File-specific JSON: <name>.json next to <name>.md
  const fileJsonPath = path.join(dir, `${basename}.json`);
  if (fs.existsSync(fileJsonPath)) {
    result.fileData = safeLoadJson(fileJsonPath);
  }

  // 4. Locale-specific JSON: <locale>.json next to <locale>.md
  const localeJsonPath = path.join(dir, `${locale}.json`);
  if (fs.existsSync(localeJsonPath)) {
    // If locale JSON is the same as file JSON, it was already loaded above;
    // only load separately if they're different files
    if (localeJsonPath === fileJsonPath) {
      result.localeData = result.fileData;
    } else {
      result.localeData = safeLoadJson(localeJsonPath);
    }
  }

  return result;
};

/**
 * Merge JSON data into route params.
 * Precedence (highest to lowest):
 *   frontmatter > locale JSON > file JSON > shared data.json
 */
export const mergeJsonData = (
  frontmatter: Record<string, any>,
  jsonData: JsonDataResult
): Record<string, any> => {
  return {
    ...jsonData.shared,
    ...jsonData.fileData,
    ...jsonData.localeData,
    ...frontmatter,
  };
};

/** Safely load and parse a JSON file */
const safeLoadJson = (filepath: string): Record<string, any> => {
  try {
    const content = fs.readFileSync(filepath, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.warn(
      `Warning: Failed to parse JSON file "${filepath}": ${err instanceof Error ? err.message : String(err)}`
    );
    return {};
  }
};

/**
 * Find all JSON data files in a content directory.
 * Useful for dependency tracking.
 */
export const findJsonDataFiles = async (contentDir: string): Promise<string[]> => {
  const escaped = globEscape(contentDir);
  return globby(`${escaped}/**/*.json`);
};
