import { describe, it, expect } from "vitest";
import { replacePermalinkSlugsWithValues } from "../replacePermalinkSlugsWithValues.ts";

describe("replacePermalinkSlugsWithValues", () => {
  it("replaces a single slug", () => {
    expect(replacePermalinkSlugsWithValues("/foo/[slug]/", { slug: "bar" })).toBe(
      "/foo/bar/"
    );
  });

  it("replaces multiple slugs", () => {
    expect(
      replacePermalinkSlugsWithValues("/[lang]/[slug]/", {
        lang: "en",
        slug: "hello",
      })
    ).toBe("/en/hello/");
  });

  it("leaves unmatched keys alone and warns", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = replacePermalinkSlugsWithValues("/foo/[slug]/", {});
    expect(result).toBe("/foo/[slug]/");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Unresolved slug")
    );
    consoleSpy.mockRestore();
  });

  it("converts non-string values to strings", () => {
    expect(
      replacePermalinkSlugsWithValues("/page/[id]/", { id: 42 })
    ).toBe("/page/42/");
  });

  it("throws on path traversal in slug values", () => {
    expect(() =>
      replacePermalinkSlugsWithValues("/foo/[slug]/", { slug: "../etc" })
    ).toThrow("path separators");
  });

  it("throws on slashes in slug values", () => {
    expect(() =>
      replacePermalinkSlugsWithValues("/foo/[slug]/", { slug: "a/b" })
    ).toThrow("path separators");
  });

  it("throws on backslashes in slug values", () => {
    expect(() =>
      replacePermalinkSlugsWithValues("/foo/[slug]/", { slug: "a\\b" })
    ).toThrow("path separators");
  });

  it("ignores non-slug keys even with path characters", () => {
    // 'template' is not a [template] slug in the permalink, so it should be ignored
    expect(
      replacePermalinkSlugsWithValues("/foo/[slug]/", {
        slug: "bar",
        template: "./templates/post.svelte",
      })
    ).toBe("/foo/bar/");
  });
});
