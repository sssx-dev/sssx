import colors from "ansi-colors";
import path from "node:path";

const { red, dim, yellow, bold, cyan } = colors;

/**
 * Format a build error into a user-friendly message with file/line info.
 */
export const formatBuildError = (err: unknown, context?: string): string => {
  if (err instanceof SSSXError) {
    return err.format();
  }

  const error = err instanceof Error ? err : new Error(String(err));
  const lines: string[] = [];

  lines.push(red(bold("  ✗ Build Error")));
  if (context) {
    lines.push(dim(`    Route: ${context}`));
  }
  lines.push("");
  lines.push(`    ${red(error.message)}`);

  // Extract file/line from stack trace
  const fileLine = extractFileLine(error.stack || "");
  if (fileLine) {
    lines.push(dim(`    at ${fileLine}`));
  }

  // Provide hints for common errors
  const hint = getHint(error.message);
  if (hint) {
    lines.push("");
    lines.push(yellow(`    💡 ${hint}`));
  }

  lines.push("");
  return lines.join("\n");
};

/**
 * Custom SSSX error with rich formatting.
 */
export class SSSXError extends Error {
  public file?: string;
  public line?: number;
  public column?: number;
  public hint?: string;
  public code?: string;

  constructor(
    message: string,
    opts: {
      file?: string;
      line?: number;
      column?: number;
      hint?: string;
      code?: string;
    } = {}
  ) {
    super(message);
    this.name = "SSSXError";
    Object.assign(this, opts);
  }

  format(): string {
    const lines: string[] = [];
    lines.push(red(bold("  ✗ Error")));

    if (this.file) {
      const loc = this.line
        ? `${this.file}:${this.line}${this.column ? `:${this.column}` : ""}`
        : this.file;
      lines.push(dim(`    File: ${cyan(loc)}`));
    }

    lines.push("");
    lines.push(`    ${red(this.message)}`);

    if (this.code) {
      lines.push("");
      lines.push(dim("    " + this.code.split("\n").join("\n    ")));
    }

    if (this.hint) {
      lines.push("");
      lines.push(yellow(`    💡 ${this.hint}`));
    }

    lines.push("");
    return lines.join("\n");
  }
}

/** Extract file:line from a stack trace */
function extractFileLine(stack: string): string | undefined {
  const lines = stack.split("\n");
  for (const line of lines) {
    const match = line.match(/at\s+.*\((.+:\d+:\d+)\)/);
    if (match) {
      // Shorten absolute paths
      let loc = match[1];
      try {
        loc = path.relative(process.cwd(), loc);
      } catch {}
      return loc;
    }
    const match2 = line.match(/at\s+(.+:\d+:\d+)/);
    if (match2) {
      let loc = match2[1];
      try {
        loc = path.relative(process.cwd(), loc);
      } catch {}
      return loc;
    }
  }
  return undefined;
}

/** Provide hints for common error messages */
function getHint(message: string): string | undefined {
  if (message.includes("Cannot find module") || message.includes("MODULE_NOT_FOUND")) {
    return "Run `npm install` to install dependencies.";
  }
  if (message.includes("sssx.config")) {
    return "Create an sssx.config.ts in your project root. Run `sssx init` to scaffold a new project.";
  }
  if (message.includes("+layout.svelte")) {
    return "Every SSSX project needs a src/+layout.svelte file. Use <slot /> to render page content.";
  }
  if (message.includes("+page.svelte")) {
    return "Each route needs a +page.svelte file. Check your src/pages/ directory structure.";
  }
  if (message.includes("ENOENT") || message.includes("no such file")) {
    return "A file referenced in your project doesn't exist. Check paths in your templates and content files.";
  }
  if (message.includes("SyntaxError") || message.includes("Unexpected token")) {
    return "Check your Svelte/TypeScript syntax. Make sure all tags are properly closed.";
  }
  if (message.includes("template")) {
    return "The 'template' field in frontmatter should point to a .svelte file relative to src/.";
  }
  if (message.includes("EACCES") || message.includes("permission denied")) {
    return "Permission denied. Check file permissions or run with appropriate access.";
  }
  if (message.includes("port") && message.includes("in use")) {
    return "Port already in use. Try `sssx dev --port 3001` or kill the process using that port.";
  }
  return undefined;
}

/**
 * Wrap a function with friendly error reporting.
 */
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (err) {
    console.error(formatBuildError(err, context));
    return undefined;
  }
};
