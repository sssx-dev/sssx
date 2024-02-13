export const getRoute = (url: string) => {
  if (url.endsWith("/")) {
    return url;
  }

  const array = url.split("/");

  if (array.length > 2) {
    return array.slice(0, -1).join("/") + "/";
  }

  return "/";
};
