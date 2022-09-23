export const delay = (miliseconds = 1000) =>
  new Promise((resolve) => setTimeout(resolve, miliseconds));
