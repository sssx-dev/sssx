import { getAllRoutes } from "../routes";
import { getConfig } from "../utils/config";

const cwd = process.cwd();
const config = await getConfig(cwd);
const allRoutes = await getAllRoutes(cwd, config);
const routes = allRoutes.map((s) => s.permalink).sort();

const prefix = process.argv[3];

routes.map((route) => {
  if (route.startsWith(prefix)) {
    // just print to stdout
    console.log(route);
  }
});
