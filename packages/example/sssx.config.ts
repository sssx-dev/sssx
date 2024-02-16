import type { Config } from "sssx";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";

const sssxConfig: Config = {
  title: "Sssx Example Title",
  assets: "public",
  site: "https://example.com/",
  postcss: {
    plugins: [autoprefixer, tailwindcss],
  },
};

export default sssxConfig;
