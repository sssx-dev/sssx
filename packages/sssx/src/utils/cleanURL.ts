export const cleanURL = (input: string) => {
  return input
    .replaceAll("//", "/")
    .replace("http:/", "http://")
    .replace("https:/", "https://");
};
