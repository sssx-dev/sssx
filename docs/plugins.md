# Plugins

SSSX plugins hook into the build lifecycle.

## Creating a plugin

```ts
import type { SSSXPlugin } from "sssx";

const myPlugin: SSSXPlugin = {
  name: "my-plugin",

  // Called once before build starts
  onBuildStart: async (ctx) => {
    console.log(`Building ${ctx.routes.length} routes...`);
  },

  // Called before each route is built
  onBeforeRoute: async (ctx) => {
    console.log(`Building ${ctx.route}...`);
  },

  // Called after each route is built
  onAfterRoute: async (ctx) => {
    // Post-process, analytics, etc.
  },

  // Called after all routes are built
  onBuildEnd: async (ctx) => {
    console.log("Build complete!");
  },

  // Transform the <head> content before writing
  transformHead: async (head, ctx) => {
    return head + `\n<script>console.log("injected")</script>`;
  },

  // Transform the full HTML before writing
  transformHTML: async (html, ctx) => {
    return html.replace("</body>", "<div>footer</div></body>");
  },
};
```

## Using plugins

```ts
// sssx.config.ts
import type { Config } from "sssx";

const config: Config = {
  plugins: [myPlugin],
};
```

## Plugin context

### BuildContext

```ts
interface BuildContext {
  config: Config;
  cwd: string;
  outdir: string;
  routes: RouteInfo[];
}
```

### RouteContext

```ts
interface RouteContext extends BuildContext {
  route: string;        // e.g., "/about/"
  segment: RouteInfo;   // route metadata
  props: Record<string, any>;  // page props
}
```
