import { describe, it, expect } from "vitest";
import { checkSlashes } from "../checkSlashes.ts";

describe("checkSlashes", () => {
  it("adds leading slash if missing", () => {
    expect(checkSlashes("foo/")).toBe("/foo/");
  });

  it("adds trailing slash if missing", () => {
    expect(checkSlashes("/foo")).toBe("/foo/");
  });

  it("adds both slashes if missing", () => {
    expect(checkSlashes("foo")).toBe("/foo/");
  });

  it("leaves correct input unchanged", () => {
    expect(checkSlashes("/foo/")).toBe("/foo/");
  });

  it("handles root path", () => {
    expect(checkSlashes("/")).toBe("/");
  });

  it("handles nested paths", () => {
    expect(checkSlashes("/foo/bar/baz")).toBe("/foo/bar/baz/");
  });
});
