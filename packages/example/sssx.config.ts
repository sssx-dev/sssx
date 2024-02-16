import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";

// const prefix = process ? "" : "npm:"; // isDeno
// const autoprefixer = (await import(`${prefix}autoprefixer`)).default;
// const tailwindcss = (await import(`${prefix}tailwindcss`)).default;

const sssxConfig: any = {
  title: "Sssx Example Title",
  assets: "public",
  site: "https://example.com/",
  postcss: {
    plugins: [autoprefixer, tailwindcss],
  },
};

export default sssxConfig;
