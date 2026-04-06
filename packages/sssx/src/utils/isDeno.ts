export const isDeno = typeof process === "undefined" || (globalThis as any).Deno !== undefined;
