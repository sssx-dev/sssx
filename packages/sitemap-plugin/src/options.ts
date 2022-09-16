export type Options = {
  origin: string;
  /**
   * paths to exclude
   * @default []
   */
  exclude: string[];
  /**
   * @default "monthly"
   */
  changefreq: 'monthly' | 'weekly' | 'daily';
  /**
   * @default 0.7
   */
  priority: number;
  /**
   * maximum number of entries per single sitemap xml
   * @default 5000
   */
  limit: number;
  /**
   * each generated file will have prefix
   * @default "sitemap"
   */
  prefix: string;
  generateRobots: boolean;
  robotsHead: string;
  /**
   * @default true
   */
  forceClean: boolean;
};

export const defaultOptions: Options = {
  origin: `https://example.org`,
  exclude: [],
  changefreq: 'monthly',
  priority: 0.7,
  limit: 5000,
  prefix: `sitemap`,
  generateRobots: true,
  robotsHead: `User-agent: *\nAllow: /`,
  forceClean: true
};
