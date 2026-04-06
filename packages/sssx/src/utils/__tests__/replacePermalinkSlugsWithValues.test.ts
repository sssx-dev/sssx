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

  it("throws on path traversal in values", () => {
    expect(() =>
      replacePermalinkSlugsWithValues("/foo/[slug]/", { slug: "../etc" })
    ).toThrow("path separators");
  });

  it("throws on slashes in values", () => {
    expect(() =>
      replacePermalinkSlugsWithValues("/foo/[slug]/", { slug: "a/b" })
    ).toThrow("path separators");
  });

  it("throws on backslashes in values", () => {
    expect(() =>
      replacePermalinkSlugsWithValues("/foo/[slug]/", { slug: "a\\b" })
    ).toThrow("path separators");
  });
});
