import { getAllRoutes } from "../routes";
import { getConfig } from "../config";
import { cwd } from "../utils/cwd";
import { args } from "../utils/args";

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
