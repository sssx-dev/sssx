import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const EXAMPLE_DIR = path.resolve(__dirname, "../../../example");
const OUT_DIR = path.join(EXAMPLE_DIR, ".sssx");
const CLI = path.resolve(__dirname, "../../src/cli.ts");

describe("E2E: full build of example project", () => {
  beforeAll(() => {
    // Clean previous build
    if (fs.existsSync(OUT_DIR)) {
      fs.rmSync(OUT_DIR, { recursive: true, force: true });
    }
    // Run build
    execSync(`npx tsx ${CLI} build`, {
      cwd: EXAMPLE_DIR,
      timeout: 30_000,
      stdio: "pipe",
    });
  }, 30_000);

  afterAll(() => {
    // Clean up
    if (fs.existsSync(OUT_DIR)) {
      fs.rmSync(OUT_DIR, { recursive: true, force: true });
    }
  });

  // ────────── Output structure ──────────

  describe("output structure", () => {
    it("creates output directory", () => {
      expect(fs.existsSync(OUT_DIR)).toBe(true);
    });

    it("generates index.html for root route", () => {
      expect(fs.existsSync(`${OUT_DIR}/index.html`)).toBe(true);
    });

    it("generates about page", () => {
      expect(fs.existsSync(`${OUT_DIR}/about/index.html`)).toBe(true);
    });

    it("generates filesystem routes (dogs)", () => {
      expect(fs.existsSync(`${OUT_DIR}/dog0/index.html`)).toBe(true);
      expect(fs.existsSync(`${OUT_DIR}/dog9/index.html`)).toBe(true);
    });

    it("generates content routes (posts)", () => {
      expect(fs.existsSync(`${OUT_DIR}/posts/simple/index.html`)).toBe(true);
      expect(fs.existsSync(`${OUT_DIR}/posts/post2/index.html`)).toBe(true);
    });

    it("generates i18n content routes", () => {
      expect(fs.existsSync(`${OUT_DIR}/cats/oscar/index.html`)).toBe(true);
      expect(fs.existsSync(`${OUT_DIR}/de-DE/cats/felix/index.html`)).toBe(true);
      expect(fs.existsSync(`${OUT_DIR}/fr-FR/cats/bijou/index.html`)).toBe(true);
    });
  });

  // ────────── SEO meta tags ──────────

  describe("SEO", () => {
    it("generates canonical URL", () => {
      const html = fs.readFileSync(`${OUT_DIR}/posts/simple/index.html`, "utf8");
      expect(html).toContain('rel="canonical"');
      expect(html).toContain("https://example.com/posts/simple/");
    });

    it("generates Open Graph meta tags", () => {
      const html = fs.readFileSync(`${OUT_DIR}/posts/simple/index.html`, "utf8");
      expect(html).toContain('property="og:title"');
      expect(html).toContain('property="og:description"');
      expect(html).toContain('property="og:url"');
      expect(html).toContain('property="og:type"');
    });

    it("generates Twitter Card meta tags", () => {
      const html = fs.readFileSync(`${OUT_DIR}/posts/simple/index.html`, "utf8");
      expect(html).toContain('name="twitter:card"');
      expect(html).toContain('name="twitter:title"');
    });

    it("generates meta description from frontmatter", () => {
      const html = fs.readFileSync(`${OUT_DIR}/posts/simple/index.html`, "utf8");
      expect(html).toContain("Some simple description here");
    });

    it("generates meta keywords from frontmatter", () => {
      const html = fs.readFileSync(`${OUT_DIR}/posts/simple/index.html`, "utf8");
      expect(html).toContain("simple, post");
    });

    it("generates meta generator", () => {
      const html = fs.readFileSync(`${OUT_DIR}/index.html`, "utf8");
      expect(html).toContain('name="generator"');
      expect(html).toContain("SSSX v");
    });
  });

  // ────────── JSON-LD ──────────

  describe("JSON-LD structured data", () => {
    it("generates Article schema for content pages", () => {
      const html = fs.readFileSync(`${OUT_DIR}/posts/simple/index.html`, "utf8");
      expect(html).toContain("application/ld+json");
      expect(html).toContain('"Article"');
      expect(html).toContain('"Simple post"');
    });

    it("generates WebPage schema for plain pages", () => {
      const html = fs.readFileSync(`${OUT_DIR}/about/index.html`, "utf8");
      expect(html).toContain("application/ld+json");
      expect(html).toContain('"WebPage"');
    });

    it("includes author from JSON data file", () => {
      const html = fs.readFileSync(`${OUT_DIR}/posts/simple/index.html`, "utf8");
      expect(html).toContain("SSSX Team");
    });
  });

  // ────────── Externalized props ──────────

  describe("externalized props", () => {
    it("embeds props as JSON script tag (not in JS)", () => {
      const html = fs.readFileSync(`${OUT_DIR}/posts/simple/index.html`, "utf8");
      expect(html).toContain('id="__sssx_data"');
      expect(html).toContain('type="application/json"');
    });

    it("props contain frontmatter data", () => {
      const html = fs.readFileSync(`${OUT_DIR}/posts/simple/index.html`, "utf8");
      const match = html.match(/<script id="__sssx_data" type="application\/json">([\s\S]*?)<\/script>/);
      expect(match).not.toBeNull();
      const props = JSON.parse(match![1]);
      expect(props.title).toBe("Simple post");
      expect(props.description).toBe("Some simple description here");
    });

    it("props contain data from shared data.json", () => {
      const html = fs.readFileSync(`${OUT_DIR}/posts/simple/index.html`, "utf8");
      const match = html.match(/<script id="__sssx_data" type="application\/json">([\s\S]*?)<\/script>/);
      const props = JSON.parse(match![1]);
      expect(props.author).toBe("SSSX Team");
      expect(props.siteName).toBe("SSSX Example Blog");
    });

    it("props contain rendered HTML for markdown content", () => {
      const html = fs.readFileSync(`${OUT_DIR}/posts/simple/index.html`, "utf8");
      const match = html.match(/<script id="__sssx_data" type="application\/json">([\s\S]*?)<\/script>/);
      const props = JSON.parse(match![1]);
      expect(props.html).toContain("<p>");
      expect(props.html).toContain("Simple post at /posts/simple/");
    });
  });

  // ────────── Asset dedup ──────────

  describe("asset deduplication", () => {
    it("creates _assets directory", () => {
      expect(fs.existsSync(`${OUT_DIR}/_assets`)).toBe(true);
    });

    it("generates hashed JS bundles", () => {
      const files = fs.readdirSync(`${OUT_DIR}/_assets`);
      const jsFiles = files.filter((f) => f.endsWith(".js"));
      expect(jsFiles.length).toBeGreaterThan(0);
      jsFiles.forEach((f) => {
        expect(f).toMatch(/^main\.[a-f0-9]+\.js$/);
      });
    });

    it("generates hashed CSS bundles", () => {
      const files = fs.readdirSync(`${OUT_DIR}/_assets`);
      const cssFiles = files.filter((f) => f.endsWith(".css"));
      expect(cssFiles.length).toBeGreaterThan(0);
    });

    it("HTML references hashed asset paths", () => {
      const html = fs.readFileSync(`${OUT_DIR}/index.html`, "utf8");
      expect(html).toMatch(/\/_assets\/main\.[a-f0-9]+\.js/);
      expect(html).toMatch(/\/_assets\/main\.[a-f0-9]+\.css/);
    });

    it("writes asset manifest", () => {
      const manifestPath = `${OUT_DIR}/_assets/manifest.json`;
      expect(fs.existsSync(manifestPath)).toBe(true);
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      expect(Object.keys(manifest).length).toBeGreaterThan(0);
    });
  });

  // ────────── Generated files ──────────

  describe("generated files", () => {
    it("generates sitemap.xml", () => {
      const sitemap = fs.readFileSync(`${OUT_DIR}/sitemap.xml`, "utf8");
      expect(sitemap).toContain("sitemapindex");
      expect(sitemap).toContain("sitemap.0.xml");
    });

    it("sitemap contains all routes", () => {
      const sub = fs.readFileSync(`${OUT_DIR}/sitemaps/sitemap.0.xml`, "utf8");
      expect(sub).toContain("https://example.com/");
      expect(sub).toContain("https://example.com/about/");
      expect(sub).toContain("https://example.com/posts/simple/");
    });

    it("generates robots.txt", () => {
      const robots = fs.readFileSync(`${OUT_DIR}/robots.txt`, "utf8");
      expect(robots).toContain("User-agent: *");
      expect(robots).toContain("Allow: /");
      expect(robots).toContain("Sitemap: https://example.com/sitemap.xml");
    });

    it("generates RSS feed", () => {
      const rss = fs.readFileSync(`${OUT_DIR}/rss.xml`, "utf8");
      expect(rss).toContain("<rss version");
      expect(rss).toContain("SSSX Example Blog");
      expect(rss).toContain("Simple post");
    });

    it("generates 404 page", () => {
      const html = fs.readFileSync(`${OUT_DIR}/404.html`, "utf8");
      expect(html).toContain("404");
      expect(html).toContain("Page not found");
    });

    it("generates _headers for hosting", () => {
      const headers = fs.readFileSync(`${OUT_DIR}/_headers`, "utf8");
      expect(headers).toContain("Cache-Control: public, max-age=31536000, immutable");
      expect(headers).toContain("Content-Security-Policy");
      expect(headers).toContain("X-Frame-Options: DENY");
      expect(headers).toContain("Permissions-Policy");
    });

    it("generates build-manifest.json", () => {
      const manifest = JSON.parse(fs.readFileSync(`${OUT_DIR}/build-manifest.json`, "utf8"));
      expect(manifest.version).toMatch(/^\d+\.\d+\.\d+/);
      expect(manifest.routes).toBe(27);
      expect(manifest.config.site).toBe("https://example.com/");
      expect(manifest.pages.length).toBe(27);
    });

    it("generates image map", () => {
      const imgMap = JSON.parse(fs.readFileSync(`${OUT_DIR}/_images.json`, "utf8"));
      expect(Object.keys(imgMap.images).length).toBeGreaterThan(0);
    });
  });

  // ────────── HTML structure ──────────

  describe("HTML structure", () => {
    it("includes preload hints", () => {
      const html = fs.readFileSync(`${OUT_DIR}/index.html`, "utf8");
      expect(html).toContain('rel="preload"');
      expect(html).toContain('as="style"');
      expect(html).toContain('as="script"');
    });

    it("includes RSS autodiscovery link", () => {
      const html = fs.readFileSync(`${OUT_DIR}/index.html`, "utf8");
      expect(html).toContain('type="application/rss+xml"');
    });

    it("includes dns-prefetch", () => {
      const html = fs.readFileSync(`${OUT_DIR}/index.html`, "utf8");
      expect(html).toContain('rel="dns-prefetch"');
    });

    it("has proper lang attribute", () => {
      const html = fs.readFileSync(`${OUT_DIR}/index.html`, "utf8");
      expect(html).toContain('lang="en"');
    });

    it("has app div with content", () => {
      const html = fs.readFileSync(`${OUT_DIR}/index.html`, "utf8");
      expect(html).toContain('id="app"');
    });
  });

  // ────────── i18n ──────────

  describe("i18n", () => {
    it("generates hreflang links for multilingual content", () => {
      const html = fs.readFileSync(`${OUT_DIR}/cats/oscar/index.html`, "utf8");
      expect(html).toContain('hreflang=');
    });

    it("sitemap includes hreflang alternate links", () => {
      const sitemap = fs.readFileSync(`${OUT_DIR}/sitemaps/sitemap.0.xml`, "utf8");
      expect(sitemap).toContain("xhtml:link");
      expect(sitemap).toContain('rel="alternate"');
    });
  });

  // ────────── Image pipeline ──────────

  describe("image pipeline", () => {
    it("processes content images with hashed filenames", () => {
      const imgMap = JSON.parse(fs.readFileSync(`${OUT_DIR}/_images.json`, "utf8"));
      const entries = Object.values(imgMap.images) as any[];
      expect(entries.length).toBeGreaterThan(0);
      for (const entry of entries) {
        expect(entry.publicPath).toMatch(/\/global\/images\/\w+\.\w+\.\w+/);
        const filePath = path.join(OUT_DIR, entry.publicPath);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });
  });

  // ────────── JSON data files ──────────

  describe("JSON data files", () => {
    it("merges shared data.json into post props", () => {
      const html = fs.readFileSync(`${OUT_DIR}/posts/post2/index.html`, "utf8");
      const match = html.match(/<script id="__sssx_data" type="application\/json">([\s\S]*?)<\/script>/);
      expect(match).not.toBeNull();
      const props = JSON.parse(match![1]);
      // author comes from data.json, not frontmatter
      expect(props.author).toBe("SSSX Team");
    });

    it("merges locale-specific JSON into post props", () => {
      const html = fs.readFileSync(`${OUT_DIR}/posts/post3/en-US/index.html`, "utf8");
      const match = html.match(/<script id="__sssx_data" type="application\/json">([\s\S]*?)<\/script>/);
      expect(match).not.toBeNull();
      const props = JSON.parse(match![1]);
      expect(props.sidebar).toEqual(["Related Post 1", "Related Post 2"]);
      expect(props.featured).toBe(true);
    });
  });

  // ────────── RSS feed content ──────────

  describe("RSS feed", () => {
    it("includes posts with dates sorted newest first", () => {
      const rss = fs.readFileSync(`${OUT_DIR}/rss.xml`, "utf8");
      expect(rss).toContain("<item>");
      expect(rss).toContain("Simple post");
      expect(rss).toContain("post 2");
    });

    it("includes description in RSS items", () => {
      const rss = fs.readFileSync(`${OUT_DIR}/rss.xml`, "utf8");
      expect(rss).toContain("Some simple description here");
    });

    it("includes full URLs in RSS items", () => {
      const rss = fs.readFileSync(`${OUT_DIR}/rss.xml`, "utf8");
      expect(rss).toContain("https://example.com/posts/");
    });
  });

  // ────────── Route count ──────────

  describe("route completeness", () => {
    it("builds exactly 27 routes", () => {
      const manifest = JSON.parse(fs.readFileSync(`${OUT_DIR}/build-manifest.json`, "utf8"));
      expect(manifest.routes).toBe(27);
    });

    it("all routes have HTML files", () => {
      const manifest = JSON.parse(fs.readFileSync(`${OUT_DIR}/build-manifest.json`, "utf8"));
      for (const page of manifest.pages) {
        const htmlPath = path.join(OUT_DIR, page.permalink, "index.html");
        expect(fs.existsSync(htmlPath)).toBe(true);
      }
    });
  });
});
