export const permalink = `/:dog/`;

export const all = () => {
  return [{ dog: "dog1" }, { dog: "dog2" }, { dog: "dog3" }];
};

type Param = ReturnType<typeof all>[0];

export const request = (param: Param) => {
  return {
    ...param,
    animal: "dog",
    name: `${param.dog} Dog`,
  };
};
