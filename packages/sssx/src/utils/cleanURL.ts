export const cleanURL = (input: string) => {
  // Replace 2+ consecutive slashes with a single slash
  return input
    .replace(/\/{2,}/g, "/")
    .replace("http:/", "http://")
    .replace("https:/", "https://");
};
