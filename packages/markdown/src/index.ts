import fs from 'fs';
import yaml from 'yaml';
import fg from 'fast-glob';

import { rehype } from 'rehype';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import rehypeSlug from 'rehype-slug';

import extractFrontmatter from 'remark-extract-frontmatter';
import remarkFrontmatter from 'remark-frontmatter';

import type { Plugin } from 'unified';
import type { Request } from 'sssx';

const isWin = process.platform === 'win32';
const SEPARATOR = isWin ? '\\' : '/';

type UniversalPlugin = Plugin<any, any, any>;
type PluginOrWithParams = UniversalPlugin | [UniversalPlugin, any];

const defaultPlugins: PluginOrWithParams[] = [
  remarkFrontmatter,
  [extractFrontmatter, { name: 'frontmatter', yaml: yaml.parse }],
  [remarkHtml, { sanitize: false }]
];

const prepareRemark = (plugins: PluginOrWithParams[] = defaultPlugins) => {
  const processor = remark();

  plugins = plugins
    .concat(defaultPlugins)
    .filter((value, index, array) => array.indexOf(value) === index)
    .filter((p) => !!p);

  plugins.map((plugin) => {
    if (Array.isArray(plugin)) processor.use(plugin[0], plugin[1]);
    else processor.use(plugin);
  });

  return processor;
};

const replaceValues = (html: string, frontmatter: Record<string, any>) => {
  Object.entries(frontmatter).map(([key, value]) => {
    html = html.replaceAll(`{{${key}}}`, value);
  });
  return html;
};

export const getAllMarkdown = async (glob: string) => {
  const globRegex = [process.cwd(), SEPARATOR, glob].join('');
  const files = fg.sync(globRegex);
  const array = files.map((filename) => {
    const md = fs.readFileSync(filename, 'utf8');
    const obj = prepareRemark().processSync(md);

    obj.value = rehype().use(rehypeSlug).processSync(obj.value).value;
    obj.value = replaceValues(obj.value as any, obj.data.frontmatter as any);

    return obj;
  });

  return array.map(({ data, value }) => ({
    ...(data.frontmatter as any),
    html: value
  })) as Request[];
};
