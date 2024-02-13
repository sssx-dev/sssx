export const checkSlashes = (input: string) => {
  if (!input.startsWith("/")) {
    input = `/` + input;
  }

  if (!input.endsWith("/")) {
    input += `/`;
  }

  return input;
};
