import { describe, it, expect } from "vitest";
import { validateConfig } from "../configValidation.ts";

describe("validateConfig", () => {
  it("returns no warnings for valid config", () => {
    const warnings = validateConfig({
      title: "Test",
      site: "https://example.com/",
      defaultLocale: "en-US",
    });
    expect(warnings).toHaveLength(0);
  });

  it("warns about unknown keys", () => {
    const warnings = validateConfig({ title: "Test", unknownKey: true } as any);
    expect(warnings.some((w) => w.includes("unknownKey"))).toBe(true);
  });

  it("warns about site without protocol", () => {
    const warnings = validateConfig({ site: "example.com/" });
    expect(warnings.some((w) => w.includes("http"))).toBe(true);
  });

  it("warns about site without trailing slash", () => {
    const warnings = validateConfig({ site: "https://example.com" });
    expect(warnings.some((w) => w.includes("trailing slash"))).toBe(true);
  });

  it("warns about invalid locale format", () => {
    const warnings = validateConfig({ defaultLocale: "english" });
    expect(warnings.some((w) => w.includes("BCP-47"))).toBe(true);
  });

  it("warns about conflicting outDir", () => {
    const warnings = validateConfig({ outDir: "src" });
    expect(warnings.some((w) => w.includes("conflicts"))).toBe(true);
  });

  it("accepts valid locale formats", () => {
    expect(validateConfig({ defaultLocale: "en" })).toHaveLength(0);
    expect(validateConfig({ defaultLocale: "en-US" })).toHaveLength(0);
    expect(validateConfig({ defaultLocale: "de-DE" })).toHaveLength(0);
  });
});
