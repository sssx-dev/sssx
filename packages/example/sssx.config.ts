import type { Config } from "sssx";

const sssxConfig: Config = {
  title: "SSSX Example Blog",
  assets: "public",
  site: "https://example.com/",
  defaultLocale: "en-US",
  minify: true,
  rss: true,
  generate404: true,
  plugins: [],
};

export default sssxConfig;
