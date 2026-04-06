import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DependencyGraph } from "../dependencyGraph.ts";

describe("DependencyGraph", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sssx-depgraph-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("tracks file → route dependencies", () => {
    const graph = new DependencyGraph(tmpDir);
    graph.addDependency("/posts/hello/", "/src/content/posts/hello.md");
    graph.addDependency("/posts/world/", "/src/content/posts/world.md");

    const affected = graph.getAffectedRoutes(["/src/content/posts/hello.md"]);
    expect(affected).toContain("/posts/hello/");
    expect(affected).not.toContain("/posts/world/");
  });

  it("tracks taxonomy dependencies", () => {
    const graph = new DependencyGraph(tmpDir);
    graph.addDependency("/posts/a/", "a.md");
    graph.addDependency("/posts/b/", "b.md");
    graph.addTaxonomy("tags", "javascript", "/posts/a/");
    graph.addTaxonomy("tags", "javascript", "/posts/b/");
    graph.addTaxonomy("tags", "python", "/posts/b/");

    // Changing a.md should affect both /posts/a/ and /posts/b/ (share "javascript" tag)
    const affected = graph.getAffectedRoutes(["a.md"]);
    expect(affected).toContain("/posts/a/");
    expect(affected).toContain("/posts/b/");
  });

  it("layout change affects all routes", () => {
    const graph = new DependencyGraph(tmpDir);
    graph.addDependency("/", "src/pages/+page.svelte");
    graph.addDependency("/about/", "src/pages/about/+page.svelte");

    const affected = graph.getAffectedRoutes(["src/+layout.svelte"]);
    expect(affected).toContain("/");
    expect(affected).toContain("/about/");
  });

  it("persists and loads graph", () => {
    const graph1 = new DependencyGraph(tmpDir);
    graph1.addDependency("/test/", "test.md");
    graph1.addTaxonomy("tags", "foo", "/test/");
    graph1.save();

    const graph2 = new DependencyGraph(tmpDir);
    const affected = graph2.getAffectedRoutes(["test.md"]);
    expect(affected).toContain("/test/");
    expect(graph2.getTaxonomyValues("tags")).toContain("foo");
  });

  it("buildFromRoutes extracts tags from params", () => {
    const graph = new DependencyGraph(tmpDir);
    graph.buildFromRoutes([
      {
        permalink: "/post-1/",
        param: { tags: "js, svelte" },
        file: "a.md",
        route: "/",
        locales: ["en-US"],
        locale: "en-US",
        type: "content",
      },
      {
        permalink: "/post-2/",
        param: { tags: "js, python" },
        file: "b.md",
        route: "/",
        locales: ["en-US"],
        locale: "en-US",
        type: "content",
      },
    ]);

    expect(graph.getRoutesByTaxonomy("tags", "js")).toEqual(["/post-1/", "/post-2/"]);
    expect(graph.getRoutesByTaxonomy("tags", "svelte")).toEqual(["/post-1/"]);
  });
});
