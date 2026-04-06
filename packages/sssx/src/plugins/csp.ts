import { type Config } from "../config.ts";

/**
 * Generate Content-Security-Policy header value.
 * Based on known scripts/styles from the build.
 */
export const generateCSP = (config: Config): string => {
  const directives: string[] = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // unsafe-inline needed for JSON data script
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  return directives.join("; ");
};
