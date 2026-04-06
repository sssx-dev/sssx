import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { responsiveImage, pictureElement, copyImageHashed } from "../imageOptimizer.ts";

describe("responsiveImage", () => {
  it("generates img tag with lazy loading", () => {
    const html = responsiveImage("/img/test.jpg", "Test image");
    expect(html).toContain('src="/img/test.jpg"');
    expect(html).toContain('alt="Test image"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });

  it("allows eager loading", () => {
    const html = responsiveImage("/img/test.jpg", "Test", { loading: "eager" });
    expect(html).toContain('loading="eager"');
  });

  it("escapes alt text", () => {
    const html = responsiveImage("/img/test.jpg", 'He said "hi" & <bye>');
    expect(html).toContain("&quot;");
    expect(html).toContain("&amp;");
  });
});

describe("pictureElement", () => {
  it("generates picture with sources", () => {
    const html = pictureElement(
      "/img/test.jpg",
      "Test",
      [{ src: "/img/test.webp", type: "image/webp" }]
    );
    expect(html).toContain("<picture>");
    expect(html).toContain("</picture>");
    expect(html).toContain('<source srcset="/img/test.webp" type="image/webp"');
    expect(html).toContain('src="/img/test.jpg"');
  });
});

describe("copyImageHashed", () => {
  let tmpDir: string;
  let srcFile: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sssx-img-"));
    srcFile = path.join(tmpDir, "test.jpg");
    fs.writeFileSync(srcFile, "fake image data");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("copies file with content hash", () => {
    const publicPath = copyImageHashed(srcFile, tmpDir, "global");
    expect(publicPath).toMatch(/^\/global\/test\.[a-f0-9]+\.jpg$/);

    const destPath = path.join(tmpDir, publicPath);
    expect(fs.existsSync(destPath)).toBe(true);
  });

  it("returns same path for same content", () => {
    const a = copyImageHashed(srcFile, tmpDir, "global");
    const b = copyImageHashed(srcFile, tmpDir, "global");
    expect(a).toBe(b);
  });
});
