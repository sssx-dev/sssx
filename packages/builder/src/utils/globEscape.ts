export const globEscape = (input: string) => {
  const symbols = `$^*+?()[]`.split("");
  symbols.map((symbol: string) => {
    input = input.replaceAll(symbol, `\\${symbol}`);
  });

  return input;
};
