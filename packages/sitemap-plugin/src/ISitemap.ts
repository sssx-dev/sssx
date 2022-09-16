export type IURL = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: number;
};

export interface ISitemap {
  '?xml': {
    '@_version': string; //'1.0'
    '@_encoding': string; //'UTF-8'
  };
  '@_xmlns': string;
  urlset: {
    url: IURL[];
  };
}
