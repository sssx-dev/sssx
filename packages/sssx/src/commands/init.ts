import fs from "node:fs";
import path from "node:path";
import colors from "ansi-colors";
import { cwd } from "../utils/cwd.ts";
import { args } from "../utils/args.ts";
import { getVersion } from "../utils/version.ts";

const { bold, dim, green } = colors;

const projectName = args[0] || "my-sssx-site";
const projectDir = path.join(cwd, projectName);

if (fs.existsSync(projectDir)) {
  console.error(colors.red(`\n  Directory "${projectName}" already exists.\n`));
  process.exit(1);
}

console.log(bold(`\n  Creating SSSX project: ${projectName}\n`));

// Create directory structure
const dirs = [
  "",
  "src",
  "src/pages",
  "src/content",
  "src/lib",
  "src/templates",
  "src/assets",
  "public",
];

for (const dir of dirs) {
  fs.mkdirSync(path.join(projectDir, dir), { recursive: true });
  console.log(dim(`  ${green("+")} ${projectName}/${dir || ""}`));
}

// sssx.config.ts
fs.writeFileSync(
  path.join(projectDir, "sssx.config.ts"),
  `import type { Config } from "sssx";

const config: Config = {
  title: "${projectName}",
  site: "https://example.com",
  assets: "public",
};

export default config;
`,
  "utf8"
);
console.log(dim(`  ${green("+")} sssx.config.ts`));

// package.json
fs.writeFileSync(
  path.join(projectDir, "package.json"),
  JSON.stringify(
    {
      name: projectName,
      version: "1.0.0",
      type: "module",
      scripts: {
        dev: "sssx dev open",
        build: "sssx build",
        cluster: "sssx cluster",
        clean: "sssx clean",
      },
      dependencies: {
        sssx: `^${getVersion()}`,
      },
    },
    null,
    2
  ) + "\n",
  "utf8"
);
console.log(dim(`  ${green("+")} package.json`));

// src/+layout.svelte
fs.writeFileSync(
  path.join(projectDir, "src/+layout.svelte"),
  `<script lang="ts">
</script>

<slot />

<style>
  :global(body) {
    font-family: system-ui, -apple-system, sans-serif;
    margin: 0;
    padding: 2rem;
    color: #333;
  }
</style>
`,
  "utf8"
);
console.log(dim(`  ${green("+")} src/+layout.svelte`));

// src/pages/+page.svelte
fs.writeFileSync(
  path.join(projectDir, "src/pages/+page.svelte"),
  `<script lang="ts">
  export let data: any = {};
</script>

<svelte:head>
  <title>${projectName}</title>
</svelte:head>

<main>
  <h1>Welcome to ${projectName}</h1>
  <p>Built with <a href="https://sssx.dev">SSSX</a> — the static site generator for millions of pages.</p>
</main>
`,
  "utf8"
);
console.log(dim(`  ${green("+")} src/pages/+page.svelte`));

// src/pages/about/+page.svelte
fs.mkdirSync(path.join(projectDir, "src/pages/about"), { recursive: true });
fs.writeFileSync(
  path.join(projectDir, "src/pages/about/+page.svelte"),
  `<script lang="ts">
  export let data: any = {};
</script>

<svelte:head>
  <title>About — ${projectName}</title>
</svelte:head>

<main>
  <h1>About</h1>
  <p>This is the about page.</p>
  <a href="/">← Back home</a>
</main>
`,
  "utf8"
);
console.log(dim(`  ${green("+")} src/pages/about/+page.svelte`));

// .gitignore
fs.writeFileSync(
  path.join(projectDir, ".gitignore"),
  `node_modules
.sssx
*.tsbuildinfo
.DS_Store
`,
  "utf8"
);
console.log(dim(`  ${green("+")} .gitignore`));

console.log(bold(`\n  ✓ Project created!\n`));
console.log(`  Next steps:\n`);
console.log(dim(`    cd ${projectName}`));
console.log(dim(`    npm install`));
console.log(dim(`    npx sssx dev open\n`));
