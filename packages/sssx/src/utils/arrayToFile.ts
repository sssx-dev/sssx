export const arrayToFile = <T>(array: T[], name = "all") => {
  let data = `export const ${name} = [\n`;
  array.map((url) => {
    data += `"${url}",\n`;
  });
  data += `];\n`;
  return data;
};
