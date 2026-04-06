/** converts /foo/[slug]/ into /foo/bar/ if slug = 'bar' */
export const replacePermalinkSlugsWithValues = (
  permalink: string,
  object: Record<string, any>
) => {
  // Find all [key] patterns in the permalink first, then replace
  const slugMatches = permalink.match(/\[([^\]]+)\]/g) || [];

  for (const match of slugMatches) {
    const key = match.slice(1, -1); // strip [ and ]
    if (key in object) {
      const value = String(object[key]);

      // Prevent path traversal via slug values
      if (value.includes("..") || value.includes("/") || value.includes("\\")) {
        throw new Error(
          `Invalid slug value for "[${key}]": "${value}" — slug values must not contain path separators or ".."`,
        );
      }

      permalink = permalink.replace(`[${key}]`, value);
    }
  }

  // Warn about unresolved slugs
  const unresolved = permalink.match(/\[([^\]]+)\]/g);
  if (unresolved) {
    console.warn(
      `Warning: Unresolved slug(s) in permalink "${permalink}": ${unresolved.join(", ")}`,
    );
  }

  return permalink;
};
