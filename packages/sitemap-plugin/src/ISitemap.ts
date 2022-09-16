export type IURL = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: number;
};

export interface ISitemap {
  '@_xmlns': string;
  urlset: {
    url: IURL[];
  };
}
