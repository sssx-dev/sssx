import fs from "node:fs";
import { unified, type Plugin } from "unified";
// import remarkParse from "npm:remark-parse";
import remarkToc from "remark-toc";
import remarkRehype from "remark-rehype";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import { Config } from "../config.ts";

export const markdown = async (path: string, config: Config) => {
  const input = fs.readFileSync(path, "utf8");
  const file = await unified()
    .use(require("remarkParse"))
    .use(remarkToc)
    .use(remarkRehype)
    .use(remarkFrontmatter, ["yaml", "toml"])
    .use(rehypeFormat)
    .use(rehypeStringify)
    .use(config.rehypePlugins)
    .process(input);

  return file.value;
};
