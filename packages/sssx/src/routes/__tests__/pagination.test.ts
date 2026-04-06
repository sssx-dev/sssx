import { describe, it, expect } from "vitest";
import { paginate, taxonomyPages } from "../pagination.ts";

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ id: i, title: `Post ${i}` }));

  it("paginates into correct number of pages", () => {
    const pages = paginate(items, { pageSize: 10, prefix: "/blog" });
    expect(pages).toHaveLength(3);
    expect(pages[0].page).toBe(1);
    expect(pages[2].page).toBe(3);
  });

  it("first page has correct permalink", () => {
    const pages = paginate(items, { pageSize: 10, prefix: "/blog" });
    expect(pages[0].permalink).toBe("/blog/");
    expect(pages[1].permalink).toBe("/blog/page/2/");
    expect(pages[2].permalink).toBe("/blog/page/3/");
  });

  it("sets correct navigation links", () => {
    const pages = paginate(items, { pageSize: 10, prefix: "/blog" });
    expect(pages[0].prevPage).toBeNull();
    expect(pages[0].nextPage).toBe("/blog/page/2/");
    expect(pages[1].prevPage).toBe("/blog/");
    expect(pages[1].nextPage).toBe("/blog/page/3/");
    expect(pages[2].prevPage).toBe("/blog/page/2/");
    expect(pages[2].nextPage).toBeNull();
  });

  it("distributes items correctly", () => {
    const pages = paginate(items, { pageSize: 10, prefix: "/blog" });
    expect(pages[0].items).toHaveLength(10);
    expect(pages[1].items).toHaveLength(10);
    expect(pages[2].items).toHaveLength(5);
  });

  it("sets metadata correctly", () => {
    const pages = paginate(items, { pageSize: 10, prefix: "/blog" });
    expect(pages[0].totalPages).toBe(3);
    expect(pages[0].totalItems).toBe(25);
    expect(pages[0].isFirst).toBe(true);
    expect(pages[0].isLast).toBe(false);
    expect(pages[2].isFirst).toBe(false);
    expect(pages[2].isLast).toBe(true);
  });

  it("handles empty items", () => {
    const pages = paginate([], { pageSize: 10, prefix: "/blog" });
    expect(pages).toHaveLength(1);
    expect(pages[0].items).toHaveLength(0);
  });

  it("handles items fewer than page size", () => {
    const pages = paginate([{ id: 1 }], { pageSize: 10, prefix: "/blog" });
    expect(pages).toHaveLength(1);
    expect(pages[0].items).toHaveLength(1);
  });
});

describe("taxonomyPages", () => {
  const items = [
    { param: { tags: "javascript, svelte", title: "Post 1" } },
    { param: { tags: "javascript, python", title: "Post 2" } },
    { param: { tags: "svelte", title: "Post 3" } },
    { param: { title: "Post 4" } }, // no tags
  ];

  it("groups items by taxonomy values", () => {
    const pages = taxonomyPages(items, "tags");
    expect(pages.length).toBe(3); // javascript, svelte, python
  });

  it("counts items per taxonomy value", () => {
    const pages = taxonomyPages(items, "tags");
    const js = pages.find((p) => p.value === "javascript");
    expect(js?.count).toBe(2);
    const svelte = pages.find((p) => p.value === "svelte");
    expect(svelte?.count).toBe(2);
  });

  it("generates correct permalinks", () => {
    const pages = taxonomyPages(items, "tags", { prefix: "/tags" });
    const js = pages.find((p) => p.value === "javascript");
    expect(js?.permalink).toBe("/tags/javascript/");
  });

  it("sorts by count descending", () => {
    const pages = taxonomyPages(items, "tags");
    expect(pages[0].count).toBeGreaterThanOrEqual(pages[pages.length - 1].count);
  });

  it("handles missing taxonomy gracefully", () => {
    const pages = taxonomyPages(items, "categories");
    expect(pages).toHaveLength(0);
  });
});
