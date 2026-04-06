import { type Config } from "../config.ts";
import { type RouteInfo } from "./types.ts";
import { getFileSystemRoutes } from "./getFileSystemRoutes.ts";
import { getPlainRoutes } from "./getPlainRoutes.ts";
import { getContentRoutes } from "./getContentRoutes.ts";

/**
 * Async generator that yields routes in batches.
 * For sites with millions of pages, this avoids loading all routes into memory.
 *
 * Usage:
 *   for await (const batch of streamRoutes(cwd, config, 100)) {
 *     for (const route of batch) {
 *       await buildRoute(route, ...);
 *     }
 *   }
 */
export async function* streamRoutes(
  cwd: string,
  config: Config,
  batchSize: number = 100
): AsyncGenerator<RouteInfo[]> {
  const srcDir = `${cwd}/src/pages`;

  // Yield plain routes first (usually few)
  const plain = await getPlainRoutes(srcDir, config);
  if (plain.length > 0) yield plain;

  // Yield filesystem routes in batches
  const filesystem = await getFileSystemRoutes(srcDir, config);
  for (let i = 0; i < filesystem.length; i += batchSize) {
    yield filesystem.slice(i, i + batchSize);
  }

  // Yield content routes in batches
  const content = await getContentRoutes(cwd, config);
  for (let i = 0; i < content.length; i += batchSize) {
    yield content.slice(i, i + batchSize);
  }
}

/**
 * Count total routes without loading all into memory at once.
 * Returns approximate count for progress bars.
 */
export const countRoutes = async (cwd: string, config: Config): Promise<number> => {
  let count = 0;
  for await (const batch of streamRoutes(cwd, config)) {
    count += batch.length;
  }
  return count;
};
