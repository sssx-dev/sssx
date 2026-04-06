import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadJsonData, mergeJsonData } from "../loadJsonData.ts";

describe("loadJsonData", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sssx-json-"));
    // Create content structure
    fs.mkdirSync(path.join(tmpDir, "posts"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, "posts", "hello"), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("loads file-specific .json next to .md", () => {
    const mdFile = path.join(tmpDir, "posts", "hello.md");
    const jsonFile = path.join(tmpDir, "posts", "hello.json");
    fs.writeFileSync(mdFile, "# Hello", "utf8");
    fs.writeFileSync(jsonFile, JSON.stringify({ author: "John", extra: 42 }), "utf8");

    const result = loadJsonData(mdFile, "en-US", {});
    expect(result.fileData.author).toBe("John");
    expect(result.fileData.extra).toBe(42);
  });

  it("loads shared data.json from same directory", () => {
    const mdFile = path.join(tmpDir, "posts", "hello.md");
    const dataFile = path.join(tmpDir, "posts", "data.json");
    fs.writeFileSync(mdFile, "# Hello", "utf8");
    fs.writeFileSync(dataFile, JSON.stringify({ template: "blog", siteName: "My Blog" }), "utf8");

    const result = loadJsonData(mdFile, "en-US", {});
    expect(result.shared.template).toBe("blog");
    expect(result.shared.siteName).toBe("My Blog");
  });

  it("loads locale-specific .json", () => {
    const mdFile = path.join(tmpDir, "posts", "hello", "en-US.md");
    const jsonFile = path.join(tmpDir, "posts", "hello", "en-US.json");
    fs.writeFileSync(mdFile, "# Hello", "utf8");
    fs.writeFileSync(jsonFile, JSON.stringify({ greeting: "Hello" }), "utf8");

    const result = loadJsonData(mdFile, "en-US", {});
    expect(result.localeData.greeting).toBe("Hello");
  });

  it("handles missing JSON files gracefully", () => {
    const mdFile = path.join(tmpDir, "posts", "hello.md");
    fs.writeFileSync(mdFile, "# Hello", "utf8");

    const result = loadJsonData(mdFile, "en-US", {});
    expect(result.shared).toEqual({});
    expect(result.fileData).toEqual({});
    expect(result.localeData).toEqual({});
  });

  it("handles invalid JSON gracefully", () => {
    const mdFile = path.join(tmpDir, "posts", "hello.md");
    const jsonFile = path.join(tmpDir, "posts", "hello.json");
    fs.writeFileSync(mdFile, "# Hello", "utf8");
    fs.writeFileSync(jsonFile, "not valid json{}", "utf8");

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = loadJsonData(mdFile, "en-US", {});
    expect(result.fileData).toEqual({});
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe("mergeJsonData", () => {
  it("merges with correct precedence (frontmatter wins)", () => {
    const frontmatter = { title: "From Frontmatter", custom: true };
    const jsonData = {
      shared: { template: "blog", title: "From Shared" },
      fileData: { author: "John", title: "From File" },
      localeData: { greeting: "Hello", title: "From Locale" },
    };

    const merged = mergeJsonData(frontmatter, jsonData);
    expect(merged.title).toBe("From Frontmatter"); // frontmatter wins
    expect(merged.template).toBe("blog"); // from shared
    expect(merged.author).toBe("John"); // from file
    expect(merged.greeting).toBe("Hello"); // from locale
    expect(merged.custom).toBe(true); // from frontmatter
  });

  it("handles empty data", () => {
    const merged = mergeJsonData(
      { title: "Test" },
      { shared: {}, fileData: {}, localeData: {} }
    );
    expect(merged).toEqual({ title: "Test" });
  });
});
