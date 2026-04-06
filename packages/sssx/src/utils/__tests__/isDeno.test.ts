import { describe, it, expect } from "vitest";
import { isDeno } from "../isDeno.ts";

describe("isDeno", () => {
  it("returns false in Node.js environment", () => {
    expect(isDeno).toBe(false);
  });
});
