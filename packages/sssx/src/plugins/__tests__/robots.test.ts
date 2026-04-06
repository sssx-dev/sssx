import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildRobots } from "../robots.ts";
import { type Config } from "../../config.ts";

describe("buildRobots", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sssx-robots-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("generates robots.txt with sitemap", () => {
    const config: Config = { site: "https://example.com/" };
    buildRobots(tmpDir, config);

    const content = fs.readFileSync(`${tmpDir}/robots.txt`, "utf8");
    expect(content).toContain("User-agent: *");
    expect(content).toContain("Allow: /");
    expect(content).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  it("generates robots.txt without sitemap when no site", () => {
    const config: Config = {};
    buildRobots(tmpDir, config);

    const content = fs.readFileSync(`${tmpDir}/robots.txt`, "utf8");
    expect(content).toContain("User-agent: *");
    expect(content).not.toContain("Sitemap:");
  });
});
