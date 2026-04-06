import { describe, it, expect } from "vitest";
import { cleanURL } from "../cleanURL.ts";

describe("cleanURL", () => {
  it("replaces double slashes with single", () => {
    expect(cleanURL("/foo//bar")).toBe("/foo/bar");
  });

  it("replaces multiple consecutive slashes", () => {
    expect(cleanURL("/foo////bar")).toBe("/foo/bar");
  });

  it("preserves http://", () => {
    expect(cleanURL("http://example.com//foo")).toBe("http://example.com/foo");
  });

  it("preserves https://", () => {
    expect(cleanURL("https://example.com//foo//bar")).toBe(
      "https://example.com/foo/bar"
    );
  });

  it("handles triple slashes after protocol", () => {
    expect(cleanURL("https:///example.com")).toBe("https://example.com");
  });

  it("returns unchanged clean URL", () => {
    expect(cleanURL("https://example.com/foo/bar")).toBe(
      "https://example.com/foo/bar"
    );
  });
});
