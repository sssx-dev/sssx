// TODO: add safety checks here, like a missing key somewhere or incorrect symbol
/** converts /foo/[slug]/ into /foo/bar/ if slug = 'bar' */
export const replacePermalinkSlugsWithValues = (
  permalink: string,
  object: Record<string, any>
) => {
  Object.keys(object).map((key) => {
    permalink = permalink.replace(`[${key}]`, object[key]);
  });
  return permalink;
};
