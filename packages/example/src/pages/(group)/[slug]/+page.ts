export const all = () => {
  return [{ slug: "slug1" }, { slug: "slug2" }, { slug: "slug3" }];
};

type Param = ReturnType<typeof all>[0];

export const request = (param: Param) => {
  return {
    ...param,
    name: `Slug ${param.slug}`,
  };
};

export type Props = ReturnType<typeof request>;
