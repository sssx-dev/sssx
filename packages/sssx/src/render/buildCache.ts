import fs from "node:fs";
import path from "node:path";
import { hashContent } from "../utils/hashContent.ts";

/**
 * Build cache for avoiding redundant SSR/client builds.
 *
 * Caches are keyed by a hash of the input (route file + props).
 * If the cache file exists and matches, we skip the build.
 */

interface CacheEntry {
  hash: string;
  ssrOutput?: string;
  clientOutput?: string;
  timestamp: number;
}

export class BuildCache {
  private cacheDir: string;
  private entries = new Map<string, CacheEntry>();

  constructor(outdir: string) {
    this.cacheDir = path.join(outdir, ".cache");
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    this.loadIndex();
  }

  private indexPath(): string {
    return path.join(this.cacheDir, "index.json");
  }

  private loadIndex(): void {
    const indexFile = this.indexPath();
    if (fs.existsSync(indexFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(indexFile, "utf8"));
        for (const [key, val] of Object.entries(data)) {
          this.entries.set(key, val as CacheEntry);
        }
      } catch {
        // corrupted cache, start fresh
      }
    }
  }

  /** Generate a cache key from route file path and props */
  key(filePath: string, props: Record<string, any>): string {
    const content = filePath + JSON.stringify(props);
    return hashContent(content, "sha256", 16);
  }

  /** Check if a cache entry exists and is valid */
  has(cacheKey: string, filePath: string): boolean {
    const entry = this.entries.get(cacheKey);
    if (!entry) return false;

    // Invalidate if source file is newer than cache
    try {
      const stat = fs.statSync(filePath);
      return stat.mtimeMs < entry.timestamp;
    } catch {
      return false;
    }
  }

  /** Get cached SSR output */
  getSSR(cacheKey: string): string | undefined {
    return this.entries.get(cacheKey)?.ssrOutput;
  }

  /** Get cached client output */
  getClient(cacheKey: string): string | undefined {
    return this.entries.get(cacheKey)?.clientOutput;
  }

  /** Store build outputs in cache */
  set(
    cacheKey: string,
    hash: string,
    ssrOutput?: string,
    clientOutput?: string
  ): void {
    this.entries.set(cacheKey, {
      hash,
      ssrOutput,
      clientOutput,
      timestamp: Date.now(),
    });
  }

  /** Persist cache index to disk */
  save(): void {
    const data: Record<string, CacheEntry> = {};
    // Only save metadata, not full outputs (too large)
    for (const [key, entry] of this.entries) {
      data[key] = { ...entry, ssrOutput: undefined, clientOutput: undefined };
    }
    fs.writeFileSync(this.indexPath(), JSON.stringify(data), "utf8");
  }

  /** Get cache stats */
  stats() {
    return {
      entries: this.entries.size,
    };
  }
}
