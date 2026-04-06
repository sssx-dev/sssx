import { getAllRoutes } from "../routes/index.ts";
import { getConfig } from "../config.ts";
import { cwd } from "../utils/cwd.ts";
import { args, flags } from "../utils/args.ts";

const config = await getConfig(cwd);
const allRoutes = await getAllRoutes(cwd, config);
const routes = allRoutes.map((s) => s.permalink).sort();
const prefix = args[0] || "/";

const matched = routes.filter((route) => route.startsWith(prefix));

if (flags.has("json")) {
  console.log(JSON.stringify(matched, null, 2));
} else {
  if (matched.length === 0) {
    console.log(`No routes matching prefix "${prefix}"`);
  } else {
    console.log(`${matched.length} route(s) matching "${prefix}":\n`);
    matched.forEach((route) => console.log(`  ${route}`));
    console.log("");
  }
}
