import fs from "node:fs";
import path from "node:path";
import { gzipSync, brotliCompressSync } from "node:zlib";
import colors from "ansi-colors";

/**
 * Pre-compress static files with gzip and brotli at build time.
 * Many CDNs (Cloudflare, Netlify) serve pre-compressed files automatically
 * if .gz / .br versions exist.
 */

const COMPRESSIBLE = new Set(["html", "js", "css", "json", "xml", "svg", "txt", "md"]);
const MIN_SIZE = 1024; // Don't compress files smaller than 1KB

export interface CompressStats {
  filesProcessed: number;
  originalSize: number;
  gzipSize: number;
  brotliSize: number;
}

/**
 * Pre-compress all compressible files in the output directory.
 */
export const compressOutput = (outdir: string): CompressStats => {
  const stats: CompressStats = {
    filesProcessed: 0,
    originalSize: 0,
    gzipSize: 0,
    brotliSize: 0,
  };

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        const ext = path.extname(entry.name).slice(1);
        if (!COMPRESSIBLE.has(ext)) continue;

        const content = fs.readFileSync(full);
        if (content.length < MIN_SIZE) continue;

        stats.filesProcessed++;
        stats.originalSize += content.length;

        // Gzip
        const gzipped = gzipSync(content, { level: 9 });
        fs.writeFileSync(`${full}.gz`, gzipped);
        stats.gzipSize += gzipped.length;

        // Brotli
        const brotlied = brotliCompressSync(content);
        fs.writeFileSync(`${full}.br`, brotlied);
        stats.brotliSize += brotlied.length;
      }
    }
  };

  walk(outdir);
  return stats;
};

/** Print compression stats */
export const printCompressStats = (stats: CompressStats) => {
  if (stats.filesProcessed === 0) return;
  const { dim, green } = colors;
  const ratio = ((1 - stats.brotliSize / stats.originalSize) * 100).toFixed(0);
  console.log(
    dim(`  Compressed:     ${stats.filesProcessed} files, ${ratio}% smaller with brotli`)
  );
};
