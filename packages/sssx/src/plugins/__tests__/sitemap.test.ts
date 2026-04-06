import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildSitemap } from "../sitemap.ts";
import { type RouteInfo } from "../../routes/types.ts";
import { type Config } from "../../config.ts";

const makeRoute = (permalink: string): RouteInfo => ({
  permalink,
  param: {},
  file: "",
  route: "",
  locales: ["en-US"],
  locale: "en-US",
  type: "plain",
});

describe("buildSitemap", () => {
  let tmpDir: string;
  const config: Config = {
    site: "https://example.com",
    defaultLocale: "en-US",
  };

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sssx-sitemap-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("generates sitemap.xml and sub-sitemaps", async () => {
    const routes = [makeRoute("/"), makeRoute("/about/"), makeRoute("/blog/")];
    await buildSitemap(tmpDir, config, routes);

    expect(fs.existsSync(`${tmpDir}/sitemap.xml`)).toBe(true);
    expect(fs.existsSync(`${tmpDir}/sitemaps/sitemap.0.xml`)).toBe(true);

    const rootSitemap = fs.readFileSync(`${tmpDir}/sitemap.xml`, "utf-8");
    expect(rootSitemap).toContain("sitemapindex");
    expect(rootSitemap).toContain("sitemap.0.xml");

    const subSitemap = fs.readFileSync(
      `${tmpDir}/sitemaps/sitemap.0.xml`,
      "utf-8"
    );
    expect(subSitemap).toContain("https://example.com/");
    expect(subSitemap).toContain("https://example.com/about/");
    expect(subSitemap).toContain("https://example.com/blog/");
  });

  it("handles empty routes", async () => {
    await buildSitemap(tmpDir, config, []);
    expect(fs.existsSync(`${tmpDir}/sitemap.xml`)).toBe(true);
  });

  it("splits into multiple sitemaps when exceeding limit", async () => {
    // Create more routes than the MAX_URLS_PER_SITEMAP (5000)
    const routes = Array.from({ length: 5001 }, (_, i) =>
      makeRoute(`/page-${i}/`)
    );
    await buildSitemap(tmpDir, config, routes);

    expect(fs.existsSync(`${tmpDir}/sitemaps/sitemap.0.xml`)).toBe(true);
    expect(fs.existsSync(`${tmpDir}/sitemaps/sitemap.1.xml`)).toBe(true);

    const rootSitemap = fs.readFileSync(`${tmpDir}/sitemap.xml`, "utf-8");
    expect(rootSitemap).toContain("sitemap.0.xml");
    expect(rootSitemap).toContain("sitemap.1.xml");
  });
});
