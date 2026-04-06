import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildRSS } from "../rss.ts";
import { type RouteInfo } from "../../routes/types.ts";
import { type Config } from "../../config.ts";

const makeRoute = (overrides: Partial<RouteInfo> = {}): RouteInfo => ({
  permalink: "/test/",
  param: {},
  file: "",
  route: "",
  locales: ["en-US"],
  locale: "en-US",
  type: "plain",
  ...overrides,
});

describe("buildRSS", () => {
  let tmpDir: string;
  const config: Config = {
    site: "https://example.com",
    title: "Test Blog",
    defaultLocale: "en-US",
  };

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sssx-rss-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("generates RSS from content routes with dates", () => {
    const routes = [
      makeRoute({ type: "content", permalink: "/posts/hello/", param: { title: "Hello", date: "2024-01-01", description: "First post" } }),
      makeRoute({ type: "content", permalink: "/posts/world/", param: { title: "World", date: "2024-02-01" } }),
      makeRoute({ type: "plain", permalink: "/about/" }),
    ];

    buildRSS(tmpDir, config, routes);

    const rssPath = path.join(tmpDir, "rss.xml");
    expect(fs.existsSync(rssPath)).toBe(true);

    const content = fs.readFileSync(rssPath, "utf8");
    expect(content).toContain("<rss version");
    expect(content).toContain("Hello");
    expect(content).toContain("World");
    expect(content).not.toContain("/about/");
    expect(content).toContain("https://example.com/posts/hello/");
  });

  it("skips RSS when no site configured", () => {
    buildRSS(tmpDir, {}, []);
    expect(fs.existsSync(path.join(tmpDir, "rss.xml"))).toBe(false);
  });

  it("skips RSS when no content routes with dates", () => {
    const routes = [makeRoute({ type: "plain" })];
    buildRSS(tmpDir, config, routes);
    expect(fs.existsSync(path.join(tmpDir, "rss.xml"))).toBe(false);
  });
});
