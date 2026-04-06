import { describe, it, expect } from "vitest";
import { getVersion } from "../version.ts";

describe("getVersion", () => {
  it("returns a semver-like string", () => {
    const version = getVersion();
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("returns current package version", () => {
    expect(getVersion()).toBe("0.4.0");
  });

  it("caches the version on subsequent calls", () => {
    const a = getVersion();
    const b = getVersion();
    expect(a).toBe(b);
  });
});
