import fs from "node:fs";
import colors from "ansi-colors";
import { getConfig } from "../config.ts";
import { getAllRoutes } from "../routes/index.ts";
import { validateRoutes, printValidationWarnings } from "../routes/validate.ts";
import { validateConfig, printConfigWarnings } from "../utils/configValidation.ts";
import { cwd } from "../utils/cwd.ts";
import { Timer } from "../utils/timer.ts";

const { bold, dim, green, red, yellow, cyan } = colors;

const timer = new Timer();
let errorCount = 0;
let warnCount = 0;

console.log(bold("\n  SSSX Project Check\n"));

// ── Config ──────────────────────────────────────────────
const configPath = `${cwd}/sssx.config.ts`;
if (fs.existsSync(configPath)) {
  console.log(`  ${green("✓")} sssx.config.ts found`);
} else {
  console.log(`  ${red("✗")} sssx.config.ts ${red("not found")}`);
  errorCount++;
}

const config = await getConfig(cwd);
const configWarnings = validateConfig(config);
warnCount += configWarnings.length;
printConfigWarnings(configWarnings);

if (config.site) {
  console.log(dim(`    site: ${config.site}`));
} else {
  console.log(`  ${yellow("⚠")} ${yellow("site")} not configured — SEO features will be limited`);
  warnCount++;
}

// ── Layout ──────────────────────────────────────────────
const layoutPath = `${cwd}/src/+layout.svelte`;
if (fs.existsSync(layoutPath)) {
  console.log(`  ${green("✓")} src/+layout.svelte found`);
} else {
  console.log(`  ${red("✗")} src/+layout.svelte ${red("missing")}`);
  errorCount++;
}

// ── Pages ───────────────────────────────────────────────
const pagesDir = `${cwd}/src/pages`;
if (fs.existsSync(pagesDir)) {
  console.log(`  ${green("✓")} src/pages/ exists`);
} else {
  console.log(`  ${red("✗")} src/pages/ ${red("missing")}`);
  errorCount++;
}

// ── Routes ──────────────────────────────────────────────
try {
  const allRoutes = await getAllRoutes(cwd, config);
  console.log(`  ${green("✓")} ${cyan(String(allRoutes.length))} routes found`);

  const plain = allRoutes.filter((r) => r.type === "plain").length;
  const filesystem = allRoutes.filter((r) => r.type === "filesystem").length;
  const content = allRoutes.filter((r) => r.type === "content").length;
  console.log(dim(`    plain: ${plain}  dynamic: ${filesystem}  content: ${content}`));

  const routeWarnings = validateRoutes(allRoutes);
  warnCount += routeWarnings.length;
  printValidationWarnings(routeWarnings);

  // Check that all content routes have templates
  for (const route of allRoutes) {
    if (route.type === "content" && route.svelte) {
      const templatePath = `${route.route}${route.svelte}`;
      if (!fs.existsSync(templatePath)) {
        console.log(`  ${red("✗")} Template missing: ${dim(templatePath)} (used by ${route.permalink})`);
        errorCount++;
      }
    }
  }
} catch (err) {
  console.log(`  ${red("✗")} Failed to load routes: ${err instanceof Error ? err.message : String(err)}`);
  errorCount++;
}

// ── Content ─────────────────────────────────────────────
const contentDir = `${cwd}/src/content`;
if (fs.existsSync(contentDir)) {
  console.log(`  ${green("✓")} src/content/ exists`);
} else {
  console.log(dim(`  - src/content/ not present (optional)`));
}

// ── Public ──────────────────────────────────────────────
const publicDir = `${cwd}/${config.assets || "public"}`;
if (fs.existsSync(publicDir)) {
  console.log(`  ${green("✓")} ${config.assets || "public"}/ exists`);
} else {
  console.log(dim(`  - ${config.assets || "public"}/ not present (optional)`));
}

// ── Dependencies ────────────────────────────────────────
const pkgPath = `${cwd}/package.json`;
if (fs.existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.svelte) {
      console.log(`  ${green("✓")} svelte ${dim(deps.svelte)}`);
    } else {
      console.log(`  ${red("✗")} svelte ${red("not in dependencies")}`);
      errorCount++;
    }
  } catch {
    console.log(`  ${yellow("⚠")} Could not parse package.json`);
    warnCount++;
  }
}

// ── Summary ─────────────────────────────────────────────
console.log("");
if (errorCount === 0 && warnCount === 0) {
  console.log(green(bold("  ✓ All checks passed!")) + dim(` (${timer.format()})\n`));
} else if (errorCount === 0) {
  console.log(
    yellow(bold(`  ⚠ ${warnCount} warning(s)`)) +
      green(bold(", 0 errors")) +
      dim(` (${timer.format()})\n`)
  );
} else {
  console.log(
    red(bold(`  ✗ ${errorCount} error(s)`)) +
      (warnCount > 0 ? yellow(bold(`, ${warnCount} warning(s)`)) : "") +
      dim(` (${timer.format()})\n`)
  );
  process.exitCode = 1;
}
