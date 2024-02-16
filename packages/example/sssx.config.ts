import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";

const sssxConfig: any = {
  title: "Sssx Example Title",
  assets: "public",
  site: "https://example.com/",
  postcss: {
    plugins: [autoprefixer, tailwindcss],
  },
};

export default sssxConfig;
