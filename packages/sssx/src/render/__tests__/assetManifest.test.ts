import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { AssetManifest } from "../assetManifest.ts";

describe("AssetManifest", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sssx-manifest-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("registers and deduplicates assets", () => {
    const manifest = new AssetManifest(tmpDir);

    const entry1 = manifest.register("console.log('hello');", "js");
    const entry2 = manifest.register("console.log('hello');", "js");
    const entry3 = manifest.register("console.log('world');", "js");

    // Same content should return same entry
    expect(entry1.hash).toBe(entry2.hash);
    expect(entry1.publicPath).toBe(entry2.publicPath);

    // Different content should be different
    expect(entry1.hash).not.toBe(entry3.hash);

    const stats = manifest.stats();
    expect(stats.uniqueAssets).toBe(2);
    expect(stats.totalRefs).toBe(3);
    expect(stats.saved).toBe(1);
  });

  it("writes files to _assets directory", () => {
    const manifest = new AssetManifest(tmpDir);
    const entry = manifest.register("const x = 1;", "js");

    const filePath = path.join(tmpDir, entry.publicPath);
    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, "utf8")).toBe("const x = 1;");
  });

  it("writes manifest.json", () => {
    const manifest = new AssetManifest(tmpDir);
    manifest.register("test content", "js");
    manifest.writeManifest();

    const manifestPath = path.join(tmpDir, "_assets", "manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    expect(Object.keys(data)).toHaveLength(1);
  });

  it("handles CSS assets", () => {
    const manifest = new AssetManifest(tmpDir);
    const entry = manifest.register("body { color: red; }", "css");

    expect(entry.publicPath).toContain(".css");
    const filePath = path.join(tmpDir, entry.publicPath);
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
