import { describe, it, expect } from "vitest";
import { generateSEOHead } from "../seo.ts";
import { type RouteInfo } from "../../routes/types.ts";
import { type Config } from "../../config.ts";

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

const config: Config = {
  site: "https://example.com",
  title: "My Site",
  defaultLocale: "en-US",
};

describe("generateSEOHead", () => {
  it("generates canonical URL", () => {
    const head = generateSEOHead(makeRoute(), config, "https://example.com");
    expect(head).toContain('<link rel="canonical" href="https://example.com/test/"');
  });

  it("generates OG tags from params", () => {
    const route = makeRoute({
      param: {
        title: "My Page",
        description: "A great page",
        keywords: "test, page",
      },
    });
    const head = generateSEOHead(route, config, "https://example.com");
    expect(head).toContain('og:title');
    expect(head).toContain('og:description');
    expect(head).toContain('name="keywords"');
    expect(head).toContain('name="description"');
  });

  it("generates Twitter card meta", () => {
    const route = makeRoute({
      param: { title: "Title", description: "Desc" },
    });
    const head = generateSEOHead(route, config, "https://example.com");
    expect(head).toContain('twitter:card');
    expect(head).toContain('twitter:title');
    expect(head).toContain('twitter:description');
  });

  it("uses summary_large_image when image present", () => {
    const route = makeRoute({
      param: { image: "/img/hero.jpg" },
    });
    const head = generateSEOHead(route, config, "https://example.com");
    expect(head).toContain('summary_large_image');
  });

  it("generates article dates", () => {
    const route = makeRoute({
      param: { date: "2024-01-01", updated: "2024-06-01" },
    });
    const head = generateSEOHead(route, config, "https://example.com");
    expect(head).toContain('article:published_time');
    expect(head).toContain('article:modified_time');
  });

  it("escapes HTML in attribute values", () => {
    const route = makeRoute({
      param: { title: 'He said "hello" & <goodbye>' },
    });
    const head = generateSEOHead(route, config, "https://example.com");
    expect(head).toContain("&quot;");
    expect(head).toContain("&amp;");
    expect(head).not.toContain('"hello"');
  });
});
