import tailwindcss from "npm:tailwindcss";
import autoprefixer from "npm:autoprefixer";

const sssxConfig: any = {
  title: "Sssx Example Title",
  assets: "public",
  site: "https://example.com/",
  postcss: {
    plugins: [tailwindcss, autoprefixer],
  },
};

export default sssxConfig;
