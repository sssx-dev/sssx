import { describe, it, expect } from "vitest";
import { filterContentRoutes } from "../contentFilters.ts";
import { type RouteInfo } from "../../routes/types.ts";

const makeRoute = (overrides: Partial<RouteInfo> = {}): RouteInfo => ({
  permalink: "/test/",
  param: {},
  file: "",
  route: "",
  locales: ["en-US"],
  locale: "en-US",
  type: "content",
  ...overrides,
});

describe("filterContentRoutes", () => {
  it("includes regular routes", () => {
    const routes = [makeRoute({ permalink: "/" }), makeRoute({ permalink: "/about/" })];
    const result = filterContentRoutes(routes);
    expect(result.included).toHaveLength(2);
  });

  it("excludes drafts in production", () => {
    const routes = [
      makeRoute({ permalink: "/post/", param: { draft: true } }),
      makeRoute({ permalink: "/about/" }),
    ];
    const result = filterContentRoutes(routes, false);
    expect(result.included).toHaveLength(1);
    expect(result.drafts).toHaveLength(1);
  });

  it("includes drafts in dev mode", () => {
    const routes = [makeRoute({ param: { draft: true } })];
    const result = filterContentRoutes(routes, true);
    expect(result.included).toHaveLength(1);
    expect(result.included[0].param._isDraft).toBe(true);
  });

  it("excludes scheduled content (future publishAt)", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const routes = [makeRoute({ param: { publishAt: future } })];
    const result = filterContentRoutes(routes, false);
    expect(result.included).toHaveLength(0);
    expect(result.scheduled).toHaveLength(1);
  });

  it("includes past publishAt", () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const routes = [makeRoute({ param: { publishAt: past } })];
    const result = filterContentRoutes(routes, false);
    expect(result.included).toHaveLength(1);
  });

  it("excludes expired content", () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const routes = [makeRoute({ param: { expiresAt: past } })];
    const result = filterContentRoutes(routes, false);
    expect(result.included).toHaveLength(0);
    expect(result.expired).toHaveLength(1);
  });
});
