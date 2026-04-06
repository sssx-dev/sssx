import { describe, it, expect } from "vitest";
import { hashContent } from "../hashContent.ts";

describe("hashContent", () => {
  it("returns consistent hash for same content", () => {
    const a = hashContent("hello world");
    const b = hashContent("hello world");
    expect(a).toBe(b);
  });

  it("returns different hash for different content", () => {
    const a = hashContent("hello");
    const b = hashContent("world");
    expect(a).not.toBe(b);
  });

  it("respects length parameter", () => {
    expect(hashContent("test", "sha256", 4)).toHaveLength(4);
    expect(hashContent("test", "sha256", 16)).toHaveLength(16);
  });

  it("defaults to 8 character hash", () => {
    expect(hashContent("test")).toHaveLength(8);
  });

  it("supports md5 algorithm", () => {
    const hash = hashContent("test", "md5");
    expect(hash).toHaveLength(8);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });
});
