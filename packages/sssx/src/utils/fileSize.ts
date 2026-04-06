import fs from "node:fs";
import { globby } from "globby";
import colors from "ansi-colors";

/** Format bytes into human readable string */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0)} ${sizes[i]}`;
};

/** Report build output sizes grouped by file type */
export const reportBuildSize = async (outdir: string) => {
  const files = await globby(`${outdir}/**/*`);

  const groups: Record<string, { count: number; bytes: number }> = {};
  let totalBytes = 0;

  for (const file of files) {
    const stat = fs.statSync(file);
    const ext = file.split(".").pop() || "other";
    if (!groups[ext]) groups[ext] = { count: 0, bytes: 0 };
    groups[ext].count++;
    groups[ext].bytes += stat.size;
    totalBytes += stat.size;
  }

  const { dim, bold, cyan } = colors;

  console.log(dim(`  Output size:    ${bold(formatBytes(totalBytes))} (${files.length} files)`));

  // Show top file types
  const sorted = Object.entries(groups)
    .sort((a, b) => b[1].bytes - a[1].bytes)
    .slice(0, 5);

  for (const [ext, { count, bytes }] of sorted) {
    console.log(dim(`    .${ext.padEnd(10)} ${formatBytes(bytes).padStart(8)}  (${count} files)`));
  }
};
