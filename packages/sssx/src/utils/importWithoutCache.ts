export const importWithoutCache = async (modulePath: string) => {
  const cachelessPath = `${modulePath}?update=${Date.now()}`;
  //   return (await import(cachelessPath)).default;
  return import(cachelessPath);
};
