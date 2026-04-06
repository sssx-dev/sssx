import fs from "node:fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkToc from "remark-toc";
import remarkRehype from "remark-rehype";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import { type Config } from "../config.ts";
import { type ImageMap } from "../plugins/imagePipeline.ts";
import { rehypeRewriteImages } from "../plugins/rehypeImages.ts";

export const markdown = async (
  path: string,
  config: Config,
  imageMap?: ImageMap
) => {
  const input = fs.readFileSync(path, "utf8");

  let processor = unified()
    .use(remarkParse)
    .use(remarkToc)
    .use(remarkRehype)
    .use(remarkFrontmatter, ["yaml", "toml"])
    .use(rehypeFormat)
    .use(rehypeStringify);

  // Apply image rewriting if image map available
  if (imageMap && Object.keys(imageMap.images).length > 0) {
    processor = processor.use(rehypeRewriteImages(imageMap));
  }

  // Apply user rehype plugins
  if (config.rehypePlugins) {
    processor = processor.use(config.rehypePlugins);
  }

  const file = await processor.process(input);
  return file.value;
};
