import { describe, it, expect } from "vitest";
import { arrayToFile } from "../arrayToFile.ts";

describe("arrayToFile", () => {
  it("generates a named export with array items", () => {
    const result = arrayToFile(["/foo/", "/bar/"]);
    expect(result).toContain('export const all = [');
    expect(result).toContain('"/foo/"');
    expect(result).toContain('"/bar/"');
    expect(result).toContain("];");
  });

  it("uses custom name", () => {
    const result = arrayToFile(["/a/"], "urls");
    expect(result).toContain("export const urls = [");
  });

  it("handles empty array", () => {
    const result = arrayToFile([]);
    expect(result).toBe("export const all = [\n];\n");
  });
});
