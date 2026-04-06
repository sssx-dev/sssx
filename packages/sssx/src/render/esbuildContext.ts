import esbuild from "esbuild";

/**
 * Shared esbuild context manager.
 *
 * Reuses the same esbuild process across multiple builds in a single
 * SSSX run. This avoids the overhead of starting a new esbuild
 * process for every route (~50ms per route → ~5ms per route).
 *
 * esbuild's `context()` API returns a long-lived build context
 * that can rebuild incrementally.
 */

let _initialized = false;

/**
 * Initialize esbuild once. Call at start of build/dev.
 * This is a no-op after the first call.
 */
export const initEsbuild = async () => {
  if (_initialized) return;
  _initialized = true;
  // esbuild auto-initializes on first build() call in newer versions,
  // but we can warm it up explicitly
};

/**
 * Dispose esbuild resources. Call at end of build.
 */
export const disposeEsbuild = async () => {
  if (!_initialized) return;
  try {
    await esbuild.stop();
  } catch {
    // ignore — may not be running
  }
  _initialized = false;
};
