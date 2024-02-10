export const all = () => {
  // return [{ dog: "dog1" }, { dog: "dog2" }, { dog: "dog3" }];
  let array: Array<{ dog: string }> = [];
  // for (let i = 0; i < 9999; i++) {
  for (let i = 0; i < 99; i++) {
    array.push({ dog: `dog${i}` });
  }
  return array;
};

type Param = ReturnType<typeof all>[0];

export const request = (param: Param) => {
  return {
    ...param,
    animal: "dog",
    name: `${param.dog} Dog`,
  };
};

export type Props = ReturnType<typeof request>;
