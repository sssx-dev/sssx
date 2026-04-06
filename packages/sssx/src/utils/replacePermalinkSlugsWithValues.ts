/** converts /foo/[slug]/ into /foo/bar/ if slug = 'bar' */
export const replacePermalinkSlugsWithValues = (
  permalink: string,
  object: Record<string, any>
) => {
  // Only process keys that appear as [key] in the permalink
  const slugPattern = /\[([^\]]+)\]/g;
  let match;

  while ((match = slugPattern.exec(permalink)) !== null) {
    const key = match[1];
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
