import fs from "node:fs";
import path from "node:path";
import colors from "ansi-colors";
import { cwd } from "../utils/cwd.ts";
import { args, flags } from "../utils/args.ts";
import { getVersion } from "../utils/version.ts";
import { blogTemplate } from "../templates/blog.ts";
import { docsTemplate } from "../templates/docs.ts";
import { portfolioTemplate } from "../templates/portfolio.ts";

const { bold, dim, green, cyan, yellow } = colors;

const projectName = args[0] || "my-sssx-site";
const templateName = (flags.get("template") as string) || "blog";
const projectDir = path.join(cwd, projectName);
const year = new Date().getFullYear().toString();
const date = new Date().toISOString().split("T")[0];

const templates: Record<string, any> = {
  blog: blogTemplate,
  docs: docsTemplate,
  portfolio: portfolioTemplate,
};

const template = templates[templateName];

if (!template) {
  console.error(colors.red(`\n  Unknown template: "${templateName}"`));
  console.log(dim(`  Available templates: ${Object.keys(templates).join(", ")}\n`));
  process.exit(1);
}

if (fs.existsSync(projectDir)) {
  console.error(colors.red(`\n  Directory "${projectName}" already exists.\n`));
  process.exit(1);
}

console.log(bold(`\n  Creating ${cyan(templateName)} project: ${projectName}\n`));

/** Replace {{placeholders}} in template strings */
const fill = (s: string) =>
  s.replace(/\{\{name\}\}/g, projectName)
    .replace(/\{\{year\}\}/g, year)
    .replace(/\{\{date\}\}/g, date);

/** Create a file, logging it */
const writeFile = (rel: string, content: string) => {
  const full = path.join(projectDir, rel);
  const dir = path.dirname(full);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(full, fill(content), "utf8");
  console.log(dim(`  ${green("+")} ${rel}`));
};

// Common structure
fs.mkdirSync(path.join(projectDir, "public"), { recursive: true });

// package.json
writeFile(
  "package.json",
  JSON.stringify(
    {
      name: projectName,
      version: "1.0.0",
      type: "module",
      scripts: {
        dev: "sssx dev open",
        build: "sssx build",
        diff: "sssx diff",
        cluster: "sssx cluster",
        serve: "sssx serve",
        clean: "sssx clean",
      },
      dependencies: {
        sssx: `^${getVersion()}`,
      },
    },
    null,
    2
  ) + "\n"
);

// .gitignore
writeFile(
  ".gitignore",
  `node_modules\n.sssx\n.sssx-deps.json\n*.tsbuildinfo\n.DS_Store\n`
);

// Config
writeFile("sssx.config.ts", template.config);

// Layout
writeFile("src/+layout.svelte", template.layout);

// Pages
writeFile("src/pages/+page.svelte", template.indexPage);

if (template.aboutPage) {
  writeFile("src/pages/about/+page.svelte", template.aboutPage);
}

// Template-specific files
if (templateName === "blog") {
  writeFile("src/templates/post.svelte", template.postTemplate);
  writeFile("src/content/posts/data.json", template.dataJson);
  writeFile("src/content/posts/hello-world.md", template.samplePost);
}

if (templateName === "docs" && template.gettingStartedPage) {
  writeFile("src/pages/getting-started/+page.svelte", template.gettingStartedPage);
  writeFile("src/pages/configuration/+page.svelte", `<script lang="ts">
  export let data: any = {};
</script>

<svelte:head>
  <title>Configuration — ${projectName}</title>
</svelte:head>

<h1>Configuration</h1>
<p>Edit <code>sssx.config.ts</code> to configure your site.</p>
`);
}

console.log(bold(`\n  ✓ Project created!`));
console.log(dim(`    Template: ${cyan(templateName)}`));
console.log("");
console.log(`  Next steps:\n`);
console.log(dim(`    cd ${projectName}`));
console.log(dim(`    npm install`));
console.log(dim(`    npx sssx dev open\n`));
