import { describe, it, expect } from "vitest";
import { uniqueFilter } from "../uniqueFilter.ts";

describe("uniqueFilter", () => {
  it("filters duplicate strings", () => {
    expect(["a", "b", "a", "c", "b"].filter(uniqueFilter)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("filters duplicate numbers", () => {
    expect([1, 2, 2, 3, 1].filter(uniqueFilter)).toEqual([1, 2, 3]);
  });

  it("returns empty array for empty input", () => {
    expect([].filter(uniqueFilter)).toEqual([]);
  });

  it("returns same array if already unique", () => {
    expect(["a", "b", "c"].filter(uniqueFilter)).toEqual(["a", "b", "c"]);
  });
});
