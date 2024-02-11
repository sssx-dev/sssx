import fs from "fs";
import { unified } from "unified";
import stream from "unified-stream";
import remarkParse from "remark-parse";
import remarkToc from "remark-toc";
import remarkRehype from "remark-rehype";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";

export const markdown = async (path: string) => {
  const input = fs.readFileSync(path, "utf8");
  const file = await unified()
    .use(remarkParse)
    .use(remarkToc)
    .use(remarkRehype)
    .use(remarkFrontmatter, ["yaml", "toml"])
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(input);

  return file.value;
};
