import fs from "node:fs";
import path from "node:path";
import { type RouteInfo } from "../routes/types.ts";

/**
 * Dependency graph for differential builds.
 *
 * Tracks relationships between source files and output routes so that
 * when a single file changes, we know exactly which routes to rebuild.
 *
 * Dependencies:
 * - Direct: the source .md / .svelte / +page.ts that defines the route
 * - Taxonomy: tag pages, category pages that aggregate content
 * - Pagination: pages that list content (page 1, page 2, etc.)
 * - Layout: shared +layout.svelte affects all routes using it
 * - Data: .json files that provide props
 */

export interface DepEntry {
  /** Source file that was modified */
  file: string;
  /** mtime at last build */
  mtime: number;
  /** Content hash at last build */
  hash: string;
}

export interface DepGraph {
  /** file → set of permalink routes that depend on it */
  fileToDeps: Record<string, string[]>;
  /** permalink → set of source files it depends on */
  routeToFiles: Record<string, string[]>;
  /** file metadata at last build */
  files: Record<string, DepEntry>;
  /** Taxonomy index: tag/category → permalinks */
  taxonomies: Record<string, Record<string, string[]>>;
}

const GRAPH_FILE = ".sssx-deps.json";

export class DependencyGraph {
  private graph: DepGraph;
  private cwd: string;

  constructor(cwd: string) {
    this.cwd = cwd;
    this.graph = this.load();
  }

  private graphPath(): string {
    return path.join(this.cwd, GRAPH_FILE);
  }

  private load(): DepGraph {
    const p = this.graphPath();
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, "utf8"));
      } catch {
        // corrupted, start fresh
      }
    }
    return { fileToDeps: {}, routeToFiles: {}, files: {}, taxonomies: {} };
  }

  /** Register that a route depends on a source file */
  addDependency(permalink: string, file: string) {
    // file → routes
    if (!this.graph.fileToDeps[file]) {
      this.graph.fileToDeps[file] = [];
    }
    if (!this.graph.fileToDeps[file].includes(permalink)) {
      this.graph.fileToDeps[file].push(permalink);
    }
    // route → files
    if (!this.graph.routeToFiles[permalink]) {
      this.graph.routeToFiles[permalink] = [];
    }
    if (!this.graph.routeToFiles[permalink].includes(file)) {
      this.graph.routeToFiles[permalink].push(file);
    }
  }

  /** Register a taxonomy entry (e.g., tag "javascript" → [/post-1/, /post-2/]) */
  addTaxonomy(taxonomy: string, value: string, permalink: string) {
    if (!this.graph.taxonomies[taxonomy]) {
      this.graph.taxonomies[taxonomy] = {};
    }
    if (!this.graph.taxonomies[taxonomy][value]) {
      this.graph.taxonomies[taxonomy][value] = [];
    }
    const arr = this.graph.taxonomies[taxonomy][value];
    if (!arr.includes(permalink)) {
      arr.push(permalink);
    }
  }

  /** Record file metadata after build */
  recordFile(file: string, hash: string) {
    try {
      const stat = fs.statSync(file);
      this.graph.files[file] = { file, mtime: stat.mtimeMs, hash };
    } catch {
      // file may not exist
    }
  }

  /**
   * Get all routes affected by changes to the given files.
   * Includes:
   * - Direct dependents
   * - Taxonomy pages (tags, categories) that reference the same values
   * - Layout dependents (if a layout changed, all routes using it)
   */
  getAffectedRoutes(changedFiles: string[]): string[] {
    const affected = new Set<string>();

    for (const file of changedFiles) {
      // Direct dependents
      const deps = this.graph.fileToDeps[file] || [];
      deps.forEach((d) => affected.add(d));

      // If a layout changed, all routes are affected
      if (file.includes("+layout.svelte")) {
        Object.keys(this.graph.routeToFiles).forEach((r) => affected.add(r));
      }
    }

    // For each directly affected route, find taxonomy siblings
    const affectedArray = [...affected];
    for (const permalink of affectedArray) {
      for (const [taxonomy, values] of Object.entries(this.graph.taxonomies)) {
        for (const [value, routes] of Object.entries(values)) {
          if (routes.includes(permalink)) {
            // All routes sharing this taxonomy value are affected
            routes.forEach((r) => affected.add(r));
          }
        }
      }
    }

    return [...affected];
  }

  /**
   * Detect which source files have changed since last build.
   * Compares mtime of files in the graph against stored values.
   */
  getChangedFiles(): string[] {
    const changed: string[] = [];

    for (const [file, entry] of Object.entries(this.graph.files)) {
      try {
        const stat = fs.statSync(file);
        if (stat.mtimeMs > entry.mtime) {
          changed.push(file);
        }
      } catch {
        // File was deleted — counts as changed
        changed.push(file);
      }
    }

    return changed;
  }

  /** Build the graph from all routes, including JSON data and image dependencies */
  buildFromRoutes(routes: RouteInfo[], jsonFiles: string[] = [], imageFiles: string[] = []) {
    // Register direct dependencies
    for (const route of routes) {
      this.addDependency(route.permalink, route.file);

      // Tags and categories from frontmatter
      const p = route.param || {};
      if (p.tags) {
        const tags = Array.isArray(p.tags)
          ? p.tags
          : String(p.tags).split(",").map((t: string) => t.trim());
        for (const tag of tags) {
          this.addTaxonomy("tags", tag, route.permalink);
        }
      }
      if (p.categories) {
        const cats = Array.isArray(p.categories)
          ? p.categories
          : String(p.categories).split(",").map((c: string) => c.trim());
        for (const cat of cats) {
          this.addTaxonomy("categories", cat, route.permalink);
        }
      }
    }

    // Register JSON data file dependencies
    for (const jsonFile of jsonFiles) {
      const dir = path.dirname(jsonFile);
      for (const route of routes) {
        // JSON in same dir or parent dir affects the route
        if (route.file.startsWith(dir) || dir.includes(path.dirname(route.file))) {
          this.addDependency(route.permalink, jsonFile);
        }
      }
    }

    // Register image file dependencies
    for (const imgFile of imageFiles) {
      const dir = path.dirname(imgFile);
      for (const route of routes) {
        if (route.file.startsWith(dir) || path.dirname(route.file) === dir) {
          this.addDependency(route.permalink, imgFile);
        }
      }
    }
  }

  /** Persist graph to disk */
  save() {
    fs.writeFileSync(this.graphPath(), JSON.stringify(this.graph, null, 2), "utf8");
  }

  /** Get taxonomy index for building tag/category pages */
  getTaxonomies(): Record<string, Record<string, string[]>> {
    return this.graph.taxonomies;
  }

  /** Get all routes grouped by a taxonomy value */
  getRoutesByTaxonomy(taxonomy: string, value: string): string[] {
    return this.graph.taxonomies[taxonomy]?.[value] || [];
  }

  /** Get all unique values for a taxonomy */
  getTaxonomyValues(taxonomy: string): string[] {
    return Object.keys(this.graph.taxonomies[taxonomy] || {});
  }
}
