import { describe, it, expect } from "vitest";
import { getVersion } from "../version.ts";

describe("getVersion", () => {
  it("returns a semver-like string", () => {
    const version = getVersion();
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("returns 0.3.0 for current version", () => {
    expect(getVersion()).toBe("0.3.0");
  });

  it("caches the version on subsequent calls", () => {
    const a = getVersion();
    const b = getVersion();
    expect(a).toBe(b);
  });
});
