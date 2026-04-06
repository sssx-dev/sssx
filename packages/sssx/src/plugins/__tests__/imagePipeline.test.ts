import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  scanContentImages,
  processContentImages,
  resolveContentImage,
  getImagesForRoute,
} from "../imagePipeline.ts";

describe("imagePipeline", () => {
  let tmpDir: string;
  let contentDir: string;
  let outdir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sssx-imgpipe-"));
    contentDir = path.join(tmpDir, "content");
    outdir = path.join(tmpDir, "out");
    fs.mkdirSync(path.join(contentDir, "posts"), { recursive: true });
    fs.mkdirSync(outdir, { recursive: true });

    // Create fake images
    fs.writeFileSync(path.join(contentDir, "posts", "hero.jpg"), "fake-jpg-data");
    fs.writeFileSync(path.join(contentDir, "posts", "thumb.png"), "fake-png-data");
    fs.writeFileSync(path.join(contentDir, "logo.svg"), "<svg></svg>");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("scanContentImages", () => {
    it("finds all images in content directory", async () => {
      const images = await scanContentImages(contentDir);
      const keys = Object.keys(images);
      expect(keys).toHaveLength(3);
      expect(keys.some((k) => k.includes("hero.jpg"))).toBe(true);
      expect(keys.some((k) => k.includes("thumb.png"))).toBe(true);
      expect(keys.some((k) => k.includes("logo.svg"))).toBe(true);
    });
  });

  describe("processContentImages", () => {
    it("copies images with content hashes", async () => {
      const config = { globalDir: "global" };
      const imageMap = await processContentImages(contentDir, outdir, config);

      const entries = Object.values(imageMap.images);
      expect(entries.length).toBe(3);

      for (const entry of entries) {
        // Check hashed filename
        expect(entry.publicPath).toMatch(/\/global\/images\/\w+\.\w+\.\w+/);
        // Check file was copied
        const outPath = path.join(outdir, entry.publicPath);
        expect(fs.existsSync(outPath)).toBe(true);
      }
    });

    it("generates correct metadata", async () => {
      const config = { globalDir: "global" };
      const imageMap = await processContentImages(contentDir, outdir, config);

      const heroEntry = Object.values(imageMap.images).find((e) => e.name === "hero");
      expect(heroEntry).toBeDefined();
      expect(heroEntry!.ext).toBe("jpg");
      expect(heroEntry!.size).toBeGreaterThan(0);
      expect(heroEntry!.hash).toHaveLength(8);
    });
  });

  describe("resolveContentImage", () => {
    it("resolves relative image path", async () => {
      const config = { globalDir: "global" };
      const imageMap = await processContentImages(contentDir, outdir, config);

      const resolved = resolveContentImage(
        "./hero.jpg",
        path.join(contentDir, "posts", "hello.md"),
        imageMap
      );
      expect(resolved).toBeDefined();
      expect(resolved).toContain("hero");
      expect(resolved).toContain(".jpg");
    });
  });

  describe("getImagesForRoute", () => {
    it("returns images from the same content directory", async () => {
      const config = { globalDir: "global" };
      const imageMap = await processContentImages(contentDir, outdir, config);

      const routeImages = getImagesForRoute(
        path.join(contentDir, "posts", "hello.md"),
        imageMap
      );
      // Should find posts/hero.jpg and posts/thumb.png
      expect(routeImages.length).toBeGreaterThanOrEqual(2);
    });
  });
});
