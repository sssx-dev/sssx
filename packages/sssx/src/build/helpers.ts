export const getTemplateRoute = (template: string) => {
  const route = template.split(`/`).slice(-2)[0];
  return route;
};

/**
 * @returns array of each element that exists in target, but does not exist in source
 */
export const difference = <T>(source: T[], target: T[]) =>
  target.filter((x) => !source.includes(x));
