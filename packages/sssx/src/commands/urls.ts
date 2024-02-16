import { getAllRoutes } from "../routes/index.ts";
import { getConfig } from "../config.ts";
import { cwd } from "../utils/cwd.ts";
import { args } from "../utils/args.ts";

const config = await getConfig(cwd);
const allRoutes = await getAllRoutes(cwd, config);
const routes = allRoutes.map((s) => s.permalink).sort();
const prefix = args[0];

routes.map((route) => {
  if (route.startsWith(prefix)) {
    // just print to stdout
    console.log(route);
  }
});
