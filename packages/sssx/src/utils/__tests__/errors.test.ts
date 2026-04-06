import { describe, it, expect } from "vitest";
import { formatBuildError, SSSXError } from "../errors.ts";

describe("formatBuildError", () => {
  it("formats a regular Error", () => {
    const output = formatBuildError(new Error("something broke"), "/about/");
    expect(output).toContain("Build Error");
    expect(output).toContain("something broke");
    expect(output).toContain("/about/");
  });

  it("formats a string error", () => {
    const output = formatBuildError("string error");
    expect(output).toContain("string error");
  });

  it("provides hint for missing module", () => {
    const output = formatBuildError(new Error("Cannot find module 'foo'"));
    expect(output).toContain("npm install");
  });

  it("provides hint for missing config", () => {
    const output = formatBuildError(new Error("sssx.config not found"));
    expect(output).toContain("sssx init");
  });

  it("provides hint for ENOENT", () => {
    const output = formatBuildError(new Error("ENOENT: no such file"));
    expect(output).toContain("doesn't exist");
  });
});

describe("SSSXError", () => {
  it("formats with file and line info", () => {
    const err = new SSSXError("Test error", {
      file: "src/pages/+page.svelte",
      line: 42,
      column: 5,
      hint: "Check your syntax",
    });
    const output = err.format();
    expect(output).toContain("src/pages/+page.svelte:42:5");
    expect(output).toContain("Test error");
    expect(output).toContain("Check your syntax");
  });

  it("formats without optional fields", () => {
    const err = new SSSXError("Simple error");
    const output = err.format();
    expect(output).toContain("Simple error");
  });

  it("includes code snippet when provided", () => {
    const err = new SSSXError("Error", { code: "const x = 1;\nconst y = ;" });
    const output = err.format();
    expect(output).toContain("const x = 1");
  });
});
