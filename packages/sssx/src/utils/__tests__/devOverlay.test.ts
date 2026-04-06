import { describe, it, expect } from "vitest";
import { errorOverlay, dev404Page } from "../devOverlay.ts";

describe("errorOverlay", () => {
  it("generates HTML with error message", () => {
    const html = errorOverlay(new Error("Build failed"), "/about/");
    expect(html).toContain("Build Error");
    expect(html).toContain("Build failed");
    expect(html).toContain("/about/");
    expect(html).toContain("<!doctype html>");
  });

  it("handles string errors", () => {
    const html = errorOverlay("string error");
    expect(html).toContain("string error");
  });

  it("includes stack trace section", () => {
    const html = errorOverlay(new Error("test"));
    expect(html).toContain("Stack trace");
  });

  it("provides hint for svelte resolution", () => {
    const html = errorOverlay(new Error("Could not resolve svelte/internal"));
    expect(html).toContain("npm install svelte");
  });
});

describe("dev404Page", () => {
  it("generates HTML with route list", () => {
    const routes = [
      { permalink: "/", type: "plain" },
      { permalink: "/about/", type: "plain" },
      { permalink: "/blog/", type: "content" },
    ];
    const html = dev404Page("/missing/", routes);
    expect(html).toContain("404");
    expect(html).toContain("/missing/");
    expect(html).toContain("/about/");
    expect(html).toContain("/blog/");
    expect(html).toContain("3 routes");
  });

  it("includes search/filter input", () => {
    const html = dev404Page("/x/", [{ permalink: "/", type: "plain" }]);
    expect(html).toContain("Filter routes");
    expect(html).toContain("filter(");
  });

  it("shows route type badges", () => {
    const html = dev404Page("/x/", [
      { permalink: "/", type: "plain" },
      { permalink: "/blog/", type: "content" },
    ]);
    expect(html).toContain("plain");
    expect(html).toContain("content");
  });
});
