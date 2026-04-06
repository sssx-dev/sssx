import { describe, it, expect } from "vitest";
import { getRoute } from "../getRoute.ts";

describe("getRoute", () => {
  it("returns URL ending with slash as-is", () => {
    expect(getRoute("/foo/bar/")).toBe("/foo/bar/");
  });

  it("returns root for single-segment URL", () => {
    expect(getRoute("/foo")).toBe("/");
  });

  it("strips filename from deep path", () => {
    expect(getRoute("/foo/bar/main.js")).toBe("/foo/bar/");
  });

  it("returns root for root path", () => {
    expect(getRoute("/")).toBe("/");
  });

  it("handles nested routes ending with slash", () => {
    expect(getRoute("/a/b/c/")).toBe("/a/b/c/");
  });
});
