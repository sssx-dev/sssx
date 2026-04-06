import { describe, it, expect } from "vitest";
import { globEscape } from "../globEscape.ts";

describe("globEscape", () => {
  it("escapes glob special characters", () => {
    expect(globEscape("foo[bar](baz)")).toBe("foo\\[bar\\]\\(baz\\)");
  });

  it("escapes asterisks and question marks", () => {
    expect(globEscape("*.ts?")).toBe("\\*.ts\\?");
  });

  it("escapes dollar and caret", () => {
    expect(globEscape("$foo^bar")).toBe("\\$foo\\^bar");
  });

  it("escapes plus sign", () => {
    expect(globEscape("foo+bar")).toBe("foo\\+bar");
  });

  it("leaves normal paths unchanged", () => {
    expect(globEscape("/foo/bar/baz")).toBe("/foo/bar/baz");
  });
});
