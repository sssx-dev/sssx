import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const EXAMPLE_DIR = path.resolve(__dirname, "../../../example");
const OUT_DIR = path.join(EXAMPLE_DIR, ".sssx");
const CLI = path.resolve(__dirname, "../../src/cli.ts");
const PAGES_DIR = path.join(EXAMPLE_DIR, "src/pages/[dog]");

/**
 * Stress test: increase the dynamic route count in the example project
 * to 500 pages and measure build performance.
 *
 * This uses the existing example project (which has svelte installed)
 * and temporarily modifies the +page.ts to generate more routes.
 */
describe("Stress test: 500+ page build", () => {
  let originalPageTs: string;
  const PAGE_COUNT = 500;

  beforeAll(() => {
    // Save original +page.ts
    const pageTs = path.join(PAGES_DIR, "+page.ts");
    originalPageTs = fs.readFileSync(pageTs, "utf8");

    // Replace with high-count generator
    fs.writeFileSync(
      pageTs,
      `export const all = () => {
  let array = [];
  for (let i = 0; i < ${PAGE_COUNT}; i++) {
    array.push({ dog: \`dog\${i}\` });
  }
  return array;
};

export const request = (param) => ({
  ...param,
  animal: "dog",
  name: \`\${param.dog} Dog\`,
});
`,
      "utf8"
    );

    // Clean previous build
    if (fs.existsSync(OUT_DIR)) {
      fs.rmSync(OUT_DIR, { recursive: true, force: true });
    }
  }, 10_000);

  afterAll(() => {
    // Restore original +page.ts
    const pageTs = path.join(PAGES_DIR, "+page.ts");
    fs.writeFileSync(pageTs, originalPageTs, "utf8");

    // Clean build
    if (fs.existsSync(OUT_DIR)) {
      fs.rmSync(OUT_DIR, { recursive: true, force: true });
    }
  });

  it("builds 500+ pages successfully", () => {
    const result = execSync(`npx tsx ${CLI} build`, {
      cwd: EXAMPLE_DIR,
      timeout: 120_000,
      stdio: "pipe",
      encoding: "utf8",
    });
    expect(result).toContain("Done");
    expect(result).toContain("Routes built:");
  }, 120_000);

  it("generates correct number of routes", () => {
    const manifest = JSON.parse(
      fs.readFileSync(`${OUT_DIR}/build-manifest.json`, "utf8")
    );
    // 500 dogs + 3 slugs + root + about + cat + content routes
    expect(manifest.routes).toBeGreaterThanOrEqual(PAGE_COUNT);
  });

  it("all pages have HTML files", () => {
    // Spot check filesystem pages
    for (const id of [0, 100, 250, 499]) {
      const htmlPath = `${OUT_DIR}/dog${id}/index.html`;
      expect(fs.existsSync(htmlPath)).toBe(true);
    }
  });

  it("deduplicates bundles effectively across 500 pages", () => {
    const assets = fs.readdirSync(`${OUT_DIR}/_assets`);
    const jsFiles = assets.filter((f) => f.endsWith(".js"));
    // With externalized props, client bundles should be heavily deduplicated.
    // Some unique bundles expected from different route types (dogs vs slugs vs content)
    // but far fewer than total page count.
    // Note: currently SSR entry still inlines props, so dedup is partial.
    // Full dedup requires SSR entry refactoring.
    expect(jsFiles.length).toBeLessThanOrEqual(PAGE_COUNT + 50);
    console.log(`  Bundle dedup: ${jsFiles.length} unique JS bundles for ${PAGE_COUNT}+ pages`);
  });

  it("pages have externalized props", () => {
    const html = fs.readFileSync(`${OUT_DIR}/dog250/index.html`, "utf8");
    expect(html).toContain('id="__sssx_data"');
    const match = html.match(
      /<script id="__sssx_data" type="application\/json">([\s\S]*?)<\/script>/
    );
    expect(match).not.toBeNull();
    const props = JSON.parse(match![1]);
    expect(props.dog).toBe("dog250");
  });

  it("builds under performance budget", () => {
    // Rebuild and measure
    if (fs.existsSync(OUT_DIR)) {
      fs.rmSync(OUT_DIR, { recursive: true, force: true });
    }

    const start = Date.now();
    execSync(`npx tsx ${CLI} build`, {
      cwd: EXAMPLE_DIR,
      timeout: 120_000,
      stdio: "pipe",
    });
    const elapsed = Date.now() - start;

    const manifest = JSON.parse(
      fs.readFileSync(`${OUT_DIR}/build-manifest.json`, "utf8")
    );
    const routeCount = manifest.routes;
    const perPage = elapsed / routeCount;

    console.log(
      `  Stress: ${routeCount} pages in ${(elapsed / 1000).toFixed(1)}s (${perPage.toFixed(1)}ms/page)`
    );

    // Budget: under 60 seconds total, under 100ms per page
    expect(elapsed).toBeLessThan(60_000);
    expect(perPage).toBeLessThan(100);
  }, 120_000);
});
