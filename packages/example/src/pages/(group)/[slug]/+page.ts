export const all = () => {
  return [{ slug: "slug1" }, { slug: "slug2" }, { slug: "slug3" }];
};

type Param = ReturnType<typeof all>[0];

export const permalink = (param: Param) => `/${param.slug}/`;

export const request = (param: Param) => {
  return {
    ...param,
    name: `Slug ${param.slug}`,
  };
};
