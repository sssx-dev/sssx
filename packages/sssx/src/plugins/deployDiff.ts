import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Generate a deploy diff — which files changed since last deploy.
 *
 * Compares current build output against a stored deploy manifest
 * to produce a list of files to upload/delete. This is critical
 * for million-page sites where uploading everything is too slow.
 *
 * The deploy manifest stores file → hash mappings.
 */

export interface DeployDiffResult {
  /** Files that are new or changed */
  upload: string[];
  /** Files that no longer exist */
  delete: string[];
  /** Files that are unchanged */
  unchanged: number;
}

const DEPLOY_MANIFEST = ".sssx-deploy.json";

type DeployManifest = Record<string, string>;

/** Hash a file's contents */
const hashFile = (filepath: string): string => {
  const content = fs.readFileSync(filepath);
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
};

/** Scan all files in output directory and hash them */
const scanOutput = (outdir: string): DeployManifest => {
  const manifest: DeployManifest = {};

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        // Skip compressed variants
        if (full.endsWith(".gz") || full.endsWith(".br")) continue;
        const rel = full.replace(outdir, "");
        manifest[rel] = hashFile(full);
      }
    }
  };

  walk(outdir);
  return manifest;
};

/**
 * Load the previous deploy manifest.
 */
const loadPreviousManifest = (cwd: string): DeployManifest => {
  const filepath = path.join(cwd, DEPLOY_MANIFEST);
  if (fs.existsSync(filepath)) {
    try {
      return JSON.parse(fs.readFileSync(filepath, "utf8"));
    } catch {
      return {};
    }
  }
  return {};
};

/**
 * Save the current deploy manifest for next comparison.
 */
export const saveDeployManifest = (cwd: string, manifest: DeployManifest) => {
  fs.writeFileSync(
    path.join(cwd, DEPLOY_MANIFEST),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );
};

/**
 * Compute the diff between current build and last deploy.
 */
export const computeDeployDiff = (cwd: string, outdir: string): DeployDiffResult => {
  const previous = loadPreviousManifest(cwd);
  const current = scanOutput(outdir);

  const upload: string[] = [];
  const deletions: string[] = [];
  let unchanged = 0;

  // Find new or changed files
  for (const [file, hash] of Object.entries(current)) {
    if (!previous[file] || previous[file] !== hash) {
      upload.push(file);
    } else {
      unchanged++;
    }
  }

  // Find deleted files
  for (const file of Object.keys(previous)) {
    if (!(file in current)) {
      deletions.push(file);
    }
  }

  // Save current manifest for next time
  saveDeployManifest(cwd, current);

  return { upload, delete: deletions, unchanged };
};
