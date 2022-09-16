import fs from 'fs';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import type { ISitemap, IURL } from './ISitemap.js';
import { XML_PREFIX } from './constants.js';

const xmlns = `http://www.sitemaps.org/schemas/sitemap/0.9`;

export class XML {
  parser = new XMLParser({ ignoreAttributes: false });
  builder = new XMLBuilder({ indentBy: `\t`, ignoreAttributes: false, format: true });
  xml: ISitemap = {
    '@_xmlns': xmlns,
    urlset: {
      url: []
    }
  };

  constructor(private path: string) {
    if (fs.existsSync(path)) {
      const raw = fs.readFileSync(path, { encoding: 'utf-8' });
      this.xml = this.parser.parse(raw);

      // make sure url is always an array
      if (!Array.isArray(this.xml.urlset.url)) {
        if (this.xml.urlset.url) this.xml.urlset.url = [this.xml.urlset.url];
      }
    }

    // console.log(`XML`, JSON.stringify(this.xml, null, 2));
  }

  add = (url: IURL) => {
    if (!this.hasURL(url)) {
      this.xml.urlset.url.push(url);
    }
  };

  remove = (loc: string) => {
    this.xml.urlset.url = this.xml.urlset.url.filter(
      (url) => url.loc.toLowerCase() !== loc.toLowerCase()
    );
  };

  hasURL = (input: IURL, update = true) => {
    let flag = false;

    for (let i = 0; i < this.xml.urlset.url.length; i++) {
      const url = this.xml.urlset.url[i];
      if (url.loc.toLowerCase() === input.loc.toLowerCase()) {
        flag = true;
        if (update) {
          this.xml.urlset.url[i] = input;
        }
        break;
      }
    }

    return flag;
  };

  get count() {
    try {
      return this.xml.urlset.url.length;
    } catch (err) {
      1;
    }

    return 0;
  }

  save = (options: { dry: boolean } = { dry: true }) => {
    const raw = this.builder.build(this.xml);

    if (options.dry) {
      console.log(`XML -> save`);
      console.log(raw);
    } else {
      fs.writeFileSync(this.path, `${XML_PREFIX}\n${raw}`, {
        encoding: 'utf-8'
      });
    }
  };
}
