import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const sssxConfig: any = {
  title: "Sssx Example Title",
  assets: "public",
  site: "https://example.com/",
  postcss: {
    plugins: [tailwindcss, autoprefixer],
  },
};

export default sssxConfig;
