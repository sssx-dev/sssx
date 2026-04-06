import { describe, it, expect } from "vitest";
import { getConfig } from "../config.ts";
import path from "node:path";

describe("getConfig", () => {
  it("returns default config when no config file exists", async () => {
    const config = await getConfig("/nonexistent/path");
    expect(config.outDir).toBe(".sssx");
    expect(config.assets).toBe("public");
    expect(config.defaultLocale).toBe("en-US");
    expect(config.globalDir).toBe("global");
    expect(config.writeURLsIndex).toBe(false);
    expect(config.writeFilesIndex).toBe(false);
  });
});
