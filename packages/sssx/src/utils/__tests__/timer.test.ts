import { describe, it, expect } from "vitest";
import { Timer } from "../timer.ts";

describe("Timer", () => {
  it("measures elapsed time", async () => {
    const timer = new Timer();
    await new Promise((r) => setTimeout(r, 50));
    const elapsed = timer.elapsed();
    expect(elapsed).toBeGreaterThan(10);
    expect(elapsed).toBeLessThan(500);
  });

  it("formats milliseconds", () => {
    const timer = new Timer();
    const fmt = timer.format();
    expect(fmt).toMatch(/\d+ms/);
  });

  it("resets timer", async () => {
    const timer = new Timer();
    await new Promise((r) => setTimeout(r, 50));
    timer.reset();
    const elapsed = timer.elapsed();
    expect(elapsed).toBeLessThan(50);
  });
});
