import fs from "node:fs";
import path from "node:path";
import { hashContent } from "../utils/hashContent.ts";

/**
 * Asset manifest for deduplicating client bundles across routes.
 *
 * When multiple routes produce identical client JS/CSS, we store
 * a single copy in `_assets/` with a content-hash filename.
 * Each route's HTML references the shared asset instead of having
 * its own copy.
 */

export interface AssetEntry {
  /** Content hash used as filename */
  hash: string;
  /** Relative path from site root, e.g. /_assets/main.a1b2c3d4.js */
  publicPath: string;
  /** Number of routes referencing this asset */
  refCount: number;
}

export class AssetManifest {
  private assets = new Map<string, AssetEntry>();
  private assetsDir: string;
  private publicPrefix: string;

  constructor(outdir: string, prefix = "/_assets") {
    this.assetsDir = path.join(outdir, prefix);
    this.publicPrefix = prefix;

    if (!fs.existsSync(this.assetsDir)) {
      fs.mkdirSync(this.assetsDir, { recursive: true });
    }
  }

  /**
   * Register a JS or CSS asset. If content matches a previous asset,
   * returns the existing path (no new file written).
   * Otherwise writes to _assets/ and returns the new path.
   */
  register(content: string, ext: string = "js"): AssetEntry {
    const hash = hashContent(content);
    const key = `${hash}.${ext}`;

    const existing = this.assets.get(key);
    if (existing) {
      existing.refCount++;
      return existing;
    }

    const filename = `main.${hash}.${ext}`;
    const filePath = path.join(this.assetsDir, filename);
    const publicPath = `${this.publicPrefix}/${filename}`;

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, "utf8");
    }

    const entry: AssetEntry = { hash, publicPath, refCount: 1 };
    this.assets.set(key, entry);
    return entry;
  }

  /** Get stats about asset deduplication */
  stats() {
    let totalRefs = 0;
    let uniqueAssets = this.assets.size;
    for (const entry of this.assets.values()) {
      totalRefs += entry.refCount;
    }
    const saved = totalRefs - uniqueAssets;
    return { uniqueAssets, totalRefs, saved };
  }

  /** Write manifest JSON for debugging/deployment */
  writeManifest(): void {
    const manifest: Record<string, AssetEntry> = {};
    for (const [key, entry] of this.assets) {
      manifest[key] = entry;
    }
    const filePath = path.join(this.assetsDir, "manifest.json");
    fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2), "utf8");
  }
}
