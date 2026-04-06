import fs from "node:fs";
import path from "node:path";
import colors from "ansi-colors";

/**
 * Check for broken internal links across all built HTML pages.
 *
 * Scans all HTML files for <a href="..."> and verifies that
 * internal links point to existing pages.
 */

export interface BrokenLink {
  page: string;
  href: string;
  reason: string;
}

const HREF_REGEX = /href="([^"]*?)"/g;

/**
 * Check all internal links in the built output.
 */
export const checkLinks = (outdir: string): BrokenLink[] => {
  const broken: BrokenLink[] = [];
  const htmlFiles = findHtmlFiles(outdir);

  // Build a set of known paths
  const knownPaths = new Set<string>();
  for (const file of htmlFiles) {
    const rel = file.replace(outdir, "").replace("/index.html", "/").replace(/\/+/g, "/");
    knownPaths.add(rel);
  }

  // Also add non-HTML files (assets, images, etc.)
  const allFiles = findAllFiles(outdir);
  for (const file of allFiles) {
    const rel = file.replace(outdir, "");
    knownPaths.add(rel);
  }

  // Scan each HTML file
  for (const file of htmlFiles) {
    const page = file.replace(outdir, "").replace("/index.html", "/");
    const html = fs.readFileSync(file, "utf8");

    let match;
    HREF_REGEX.lastIndex = 0;
    while ((match = HREF_REGEX.exec(html)) !== null) {
      const href = match[1];

      // Skip external, anchors, protocols, empty, data URIs
      if (
        !href ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        href.startsWith("data:")
      ) {
        continue;
      }

      // Resolve relative paths
      let resolved: string;
      if (href.startsWith("/")) {
        resolved = href;
      } else {
        resolved = path.posix.resolve(path.posix.dirname(page), href);
      }

      // Normalize
      resolved = resolved.split("?")[0].split("#")[0];

      // Check if it exists
      if (!knownPaths.has(resolved)) {
        // Try with trailing slash
        const withSlash = resolved.endsWith("/") ? resolved : resolved + "/";
        const withoutSlash = resolved.endsWith("/") ? resolved.slice(0, -1) : resolved;

        if (!knownPaths.has(withSlash) && !knownPaths.has(withoutSlash)) {
          broken.push({ page, href, reason: "Target not found" });
        }
      }
    }
  }

  return broken;
};

/** Print broken link report */
export const printBrokenLinks = (broken: BrokenLink[]) => {
  const { red, dim, yellow, bold } = colors;
  if (broken.length === 0) {
    console.log(dim(`  ${colors.green("✓")} No broken internal links`));
    return;
  }

  console.log(yellow(bold(`  ⚠ ${broken.length} broken internal link(s):\n`)));

  // Group by page
  const byPage = new Map<string, BrokenLink[]>();
  for (const link of broken) {
    if (!byPage.has(link.page)) byPage.set(link.page, []);
    byPage.get(link.page)!.push(link);
  }

  for (const [page, links] of byPage) {
    console.log(dim(`    ${page}`));
    for (const link of links) {
      console.log(red(`      → ${link.href}`));
    }
  }
  console.log("");
};

function findHtmlFiles(dir: string): string[] {
  const results: string[] = [];
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) results.push(full);
    }
  };
  walk(dir);
  return results;
}

function findAllFiles(dir: string): string[] {
  const results: string[] = [];
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else results.push(full);
    }
  };
  walk(dir);
  return results;
}
