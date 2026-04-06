import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { collectRedirects, writeRedirectsFile, writeRedirectPages } from "../redirects.ts";
import { type RouteInfo } from "../../routes/types.ts";

const makeRoute = (overrides: Partial<RouteInfo> = {}): RouteInfo => ({
  permalink: "/test/",
  param: {},
  file: "",
  route: "",
  locales: ["en-US"],
  locale: "en-US",
  type: "content",
  ...overrides,
});

describe("collectRedirects", () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sssx-redir-")); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it("collects redirect_from from frontmatter", () => {
    const routes = [makeRoute({ permalink: "/new/", param: { redirect_from: "/old/" } })];
    const redirects = collectRedirects(routes, tmpDir);
    expect(redirects).toHaveLength(1);
    expect(redirects[0]).toEqual({ from: "/old/", to: "/new/", status: 301 });
  });

  it("collects redirect_to from frontmatter", () => {
    const routes = [makeRoute({ permalink: "/old/", param: { redirect_to: "/new/" } })];
    const redirects = collectRedirects(routes, tmpDir);
    expect(redirects[0]).toEqual({ from: "/old/", to: "/new/", status: 301 });
  });

  it("handles array of redirect_from", () => {
    const routes = [makeRoute({ param: { redirect_from: ["/old1/", "/old2/"] } })];
    const redirects = collectRedirects(routes, tmpDir);
    expect(redirects).toHaveLength(2);
  });

  it("loads _redirects.json", () => {
    fs.writeFileSync(path.join(tmpDir, "_redirects.json"), JSON.stringify([
      { from: "/legacy/", to: "/modern/", status: 301 },
    ]));
    const redirects = collectRedirects([], tmpDir);
    expect(redirects).toHaveLength(1);
  });
});

describe("writeRedirectsFile", () => {
  let tmpDir: string;
  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sssx-redir2-")); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it("writes _redirects in Netlify format", () => {
    writeRedirectsFile(tmpDir, [{ from: "/old/", to: "/new/", status: 301 }]);
    const content = fs.readFileSync(path.join(tmpDir, "_redirects"), "utf8");
    expect(content).toContain("/old/  /new/  301");
  });
});

describe("writeRedirectPages", () => {
  let tmpDir: string;
  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sssx-redir3-")); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it("creates HTML redirect pages", () => {
    writeRedirectPages(tmpDir, [{ from: "/old/", to: "/new/", status: 301 }]);
    const html = fs.readFileSync(path.join(tmpDir, "old", "index.html"), "utf8");
    expect(html).toContain('content="0;url=/new/"');
    expect(html).toContain('rel="canonical"');
  });
});
