import { describe, it, expect } from "vitest";
import { validateRoutes } from "../validate.ts";
import { type RouteInfo } from "../types.ts";

const makeRoute = (overrides: Partial<RouteInfo> = {}): RouteInfo => ({
  permalink: "/test/",
  param: {},
  file: "test.svelte",
  route: "/",
  locales: ["en-US"],
  locale: "en-US",
  type: "plain",
  ...overrides,
});

describe("validateRoutes", () => {
  it("detects duplicate permalinks", () => {
    const routes = [
      makeRoute({ permalink: "/about/", file: "a.svelte" }),
      makeRoute({ permalink: "/about/", file: "b.svelte" }),
    ];
    const warnings = validateRoutes(routes);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("Duplicate permalink");
    expect(warnings[0]).toContain("/about/");
  });

  it("detects unresolved slugs", () => {
    const routes = [makeRoute({ permalink: "/posts/[slug]/" })];
    const warnings = validateRoutes(routes);
    expect(warnings.some((w) => w.includes("unresolved slug"))).toBe(true);
  });

  it("detects missing leading slash", () => {
    const routes = [makeRoute({ permalink: "about/" })];
    const warnings = validateRoutes(routes);
    expect(warnings.some((w) => w.includes('doesn\'t start with "/"'))).toBe(true);
  });

  it("returns no warnings for valid routes", () => {
    const routes = [
      makeRoute({ permalink: "/", svelte: "+page.svelte" }),
      makeRoute({ permalink: "/about/", svelte: "+page.svelte" }),
    ];
    const warnings = validateRoutes(routes);
    expect(warnings).toHaveLength(0);
  });

  it("handles empty routes array", () => {
    const warnings = validateRoutes([]);
    expect(warnings).toHaveLength(0);
  });
});
