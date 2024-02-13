import fs from "fs";
import path from "path";
import { globby } from "globby";
import { Config } from "../utils/config";
import { cleanURL } from "../utils/cleanURL";
import fm from "front-matter";
import { getLocales } from "../utils/getLocales";

const MARKDOWN = "md";

export const getContentRoutes = async (
  cwd: string,
  config: Config,
  extension = MARKDOWN
) => {
  const srcDir = `${cwd}/src/content`;
  const list = (await globby(`${srcDir}/**/*.${extension}`)).map((path) =>
    path.replace(srcDir, "")
  );
  const full = list.map((route) => {
    const file = cleanURL(`${srcDir}/${route}`);

    const locales = getLocales(file, config, extension);
    const content = fs.readFileSync(file, "utf8");
    //@ts-ignore
    const frontmatter = fm(content);
    const attributes: Record<string, any> = frontmatter.attributes as any;

    let permalink = route
      .split("/")
      .filter((a) => !a.startsWith("("))
      .join("/")
      .replace(`.${extension}`, ``);

    if (permalink.endsWith(config.defaultLocale)) {
      permalink = permalink.split(config.defaultLocale)[0];
    }

    if (!permalink.endsWith("/")) {
      permalink += "/";
    }

    // because of how we will compile this later inside `generateEntryPoint.ts`
    route = "/";
    let svelte = undefined;

    if (attributes.template) {
      const array = attributes.template.split("/");
      const prefix = array.slice(0, -1);
      svelte = array.pop()!;
      route = path.normalize(`${cwd}/src/${prefix.join("/")}`);
    }

    if (!route.endsWith("/")) {
      route += "/";
    }

    return {
      file,
      route,
      svelte,
      permalink,
      param: attributes,
      locales,
    };
  });

  return full;
};
