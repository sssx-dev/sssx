export const uniqueFilter = <T>(value: T, index: number, array: T[]) =>
  array.indexOf(value) === index;
