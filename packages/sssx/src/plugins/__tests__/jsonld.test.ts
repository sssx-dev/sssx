import { describe, it, expect } from "vitest";
import { generateJsonLD } from "../jsonld.ts";
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

describe("generateJsonLD", () => {
  it("generates WebPage schema for plain routes", () => {
    const route = makeRoute({ param: { title: "Home" } });
    const output = generateJsonLD(route, config, "https://example.com");
    expect(output).toContain("application/ld+json");
    expect(output).toContain('"WebPage"');
    expect(output).toContain('"Home"');
  });

  it("generates Article schema for content routes", () => {
    const route = makeRoute({
      type: "content",
      param: { title: "My Post", date: "2024-01-01", description: "A post" },
    });
    const output = generateJsonLD(route, config, "https://example.com");
    expect(output).toContain('"Article"');
    expect(output).toContain("2024-01-01");
    expect(output).toContain("My Post");
  });

  it("generates Article schema when date is present", () => {
    const route = makeRoute({
      param: { title: "Blog", date: "2024-06-01", author: "John" },
    });
    const output = generateJsonLD(route, config, "https://example.com");
    expect(output).toContain('"Article"');
    expect(output).toContain('"John"');
    expect(output).toContain('"Person"');
  });

  it("includes canonical URL", () => {
    const route = makeRoute({ permalink: "/about/" });
    const output = generateJsonLD(route, config, "https://example.com");
    expect(output).toContain("https://example.com/about/");
  });
});
