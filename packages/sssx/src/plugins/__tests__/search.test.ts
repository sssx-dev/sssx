import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildSearchIndex, generateSearchWidget } from "../search.ts";
import { type RouteInfo } from "../../routes/types.ts";

const makeRoute = (overrides: Partial<RouteInfo> = {}): RouteInfo => ({
  permalink: "/test/",
  param: {},
  file: "",
  route: "",
  locales: ["en-US"],
  locale: "en-US",
  type: "plain",
  ...overrides,
});

describe("buildSearchIndex", () => {
  let tmpDir: string;
  const config = { site: "https://example.com", defaultLocale: "en-US" };

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sssx-search-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("generates search index JSON", () => {
    const routes = [
      makeRoute({ permalink: "/", param: { title: "Home" } }),
      makeRoute({ permalink: "/about/", param: { title: "About", description: "About us" } }),
    ];
    buildSearchIndex(tmpDir, config, routes);

    const indexPath = path.join(tmpDir, "_search", "index.json");
    expect(fs.existsSync(indexPath)).toBe(true);

    const idx = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    expect(idx.entries).toHaveLength(2);
    expect(idx.totalPages).toBe(2);
    expect(idx.entries[0].title).toBe("Home");
  });

  it("excludes draft pages", () => {
    const routes = [
      makeRoute({ param: { title: "Public" } }),
      makeRoute({ param: { title: "Draft", draft: true } }),
    ];
    buildSearchIndex(tmpDir, config, routes);

    const idx = JSON.parse(fs.readFileSync(path.join(tmpDir, "_search", "index.json"), "utf8"));
    expect(idx.entries).toHaveLength(1);
    expect(idx.entries[0].title).toBe("Public");
  });

  it("includes keywords from tags", () => {
    const routes = [makeRoute({ param: { tags: "js, svelte" } })];
    buildSearchIndex(tmpDir, config, routes);

    const idx = JSON.parse(fs.readFileSync(path.join(tmpDir, "_search", "index.json"), "utf8"));
    expect(idx.entries[0].keywords).toContain("js");
    expect(idx.entries[0].keywords).toContain("svelte");
  });
});

describe("generateSearchWidget", () => {
  it("generates HTML with search elements", () => {
    const html = generateSearchWidget();
    expect(html).toContain("sssx-search");
    expect(html).toContain("sssx-search-input");
    expect(html).toContain("sssx-search-results");
    expect(html).toContain("metaKey");
    expect(html).toContain("_search/index.json");
  });
});
