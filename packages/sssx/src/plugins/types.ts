import { type Config } from "../config.ts";
import { type RouteInfo } from "../routes/types.ts";

/**
 * SSSX Plugin interface.
 *
 * Plugins can hook into various stages of the build lifecycle.
 * All hooks are optional and async.
 */
export interface SSSXPlugin {
  /** Unique plugin name */
  name: string;

  /** Called once before the build starts */
  onBuildStart?: (ctx: BuildContext) => Promise<void> | void;

  /** Called before each route is built */
  onBeforeRoute?: (ctx: RouteContext) => Promise<void> | void;

  /** Called after each route is built */
  onAfterRoute?: (ctx: RouteContext) => Promise<void> | void;

  /** Called after all routes are built */
  onBuildEnd?: (ctx: BuildContext) => Promise<void> | void;

  /**
   * Transform the HTML output before writing.
   * Return modified HTML or undefined to skip.
   */
  transformHTML?: (html: string, ctx: RouteContext) => Promise<string> | string;

  /**
   * Transform the head content before injecting.
   * Return modified head string or undefined to skip.
   */
  transformHead?: (head: string, ctx: RouteContext) => Promise<string> | string;
}

export interface BuildContext {
  config: Config;
  cwd: string;
  outdir: string;
  routes: RouteInfo[];
}

export interface RouteContext extends BuildContext {
  route: string;
  segment: RouteInfo;
  props: Record<string, any>;
}

/**
 * Run a lifecycle hook for all plugins.
 */
export const runHook = async (
  plugins: SSSXPlugin[],
  hook: keyof SSSXPlugin,
  ctx: BuildContext | RouteContext
): Promise<void> => {
  for (const plugin of plugins) {
    const fn = plugin[hook] as ((ctx: any) => Promise<void> | void) | undefined;
    if (typeof fn === "function") {
      await fn(ctx);
    }
  }
};

/**
 * Run a transform hook (returns modified content).
 */
export const runTransform = async (
  plugins: SSSXPlugin[],
  hook: "transformHTML" | "transformHead",
  content: string,
  ctx: RouteContext
): Promise<string> => {
  let result = content;
  for (const plugin of plugins) {
    const fn = plugin[hook];
    if (typeof fn === "function") {
      const transformed = await fn(result, ctx);
      if (transformed !== undefined) {
        result = transformed;
      }
    }
  }
  return result;
};
