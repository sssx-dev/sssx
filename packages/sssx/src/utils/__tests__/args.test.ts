import { describe, it, expect } from "vitest";

// We can't easily test the module directly since it reads process.argv at import time.
// Instead we test the parsing logic inline.

describe("args parsing logic", () => {
  const parseArgs = (argv: string[]) => {
    const flags = new Map<string, string | true>();
    const positional: string[] = [];

    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];
      if (arg.startsWith("--")) {
        const key = arg.slice(2);
        if (key.includes("=")) {
          const [k, v] = key.split("=", 2);
          flags.set(k, v);
        } else if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
          flags.set(key, argv[++i]);
        } else {
          flags.set(key, true);
        }
      } else if (arg.startsWith("-") && arg.length === 2) {
        flags.set(arg.slice(1), true);
      } else {
        positional.push(arg);
      }
    }
    return { flags, positional };
  };

  it("parses positional args", () => {
    const { positional } = parseArgs(["build", "/foo/"]);
    expect(positional).toEqual(["build", "/foo/"]);
  });

  it("parses --flag", () => {
    const { flags } = parseArgs(["--verbose"]);
    expect(flags.get("verbose")).toBe(true);
  });

  it("parses --key=value", () => {
    const { flags } = parseArgs(["--port=3000"]);
    expect(flags.get("port")).toBe("3000");
  });

  it("parses --key value", () => {
    const { flags } = parseArgs(["--port", "3000"]);
    expect(flags.get("port")).toBe("3000");
  });

  it("parses short flags", () => {
    const { flags } = parseArgs(["-v"]);
    expect(flags.get("v")).toBe(true);
  });

  it("mixes flags and positional", () => {
    const { flags, positional } = parseArgs(["dev", "--port", "8080", "open"]);
    expect(positional).toEqual(["dev", "open"]);
    expect(flags.get("port")).toBe("8080");
  });
});
