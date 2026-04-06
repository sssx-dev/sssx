import fs from "node:fs";
import path from "node:path";
import { type Config } from "../config.ts";
import { hashContent } from "../utils/hashContent.ts";

export interface ImageConfig {
  /** Generate responsive image widths */
  widths?: number[];
  /** Default image quality (1-100) */
  quality?: number;
  /** Generate WebP variants */
  webp?: boolean;
  /** Generate AVIF variants */
  avif?: boolean;
  /** Lazy loading attribute */
  loading?: "lazy" | "eager";
  /** Decoding attribute */
  decoding?: "async" | "sync" | "auto";
}

const defaultImageConfig: ImageConfig = {
  widths: [640, 768, 1024, 1280, 1536],
  quality: 80,
  webp: false,
  avif: false,
  loading: "lazy",
  decoding: "async",
};

/**
 * Generate responsive <img> tag with srcset, width/height, loading attributes.
 * For use in Svelte templates or markdown rendering.
 */
export const responsiveImage = (
  src: string,
  alt: string,
  opts: Partial<ImageConfig> = {}
): string => {
  const config = { ...defaultImageConfig, ...opts };
  const attrs: string[] = [
    `src="${src}"`,
    `alt="${escapeAttr(alt)}"`,
    `loading="${config.loading}"`,
    `decoding="${config.decoding}"`,
  ];

  return `<img ${attrs.join(" ")} />`;
};

/**
 * Generate a <picture> element with multiple format sources.
 */
export const pictureElement = (
  src: string,
  alt: string,
  formats: { src: string; type: string }[] = [],
  opts: Partial<ImageConfig> = {}
): string => {
  const config = { ...defaultImageConfig, ...opts };

  let html = "<picture>\n";
  for (const format of formats) {
    html += `  <source srcset="${format.src}" type="${format.type}" />\n`;
  }
  html += `  <img src="${src}" alt="${escapeAttr(alt)}" loading="${config.loading}" decoding="${config.decoding}" />\n`;
  html += "</picture>";

  return html;
};

/**
 * Copy image with content-hash filename to output dir.
 * Returns the hashed public path.
 */
export const copyImageHashed = (
  srcPath: string,
  outdir: string,
  globalDir: string
): string => {
  const content = fs.readFileSync(srcPath);
  const hash = hashContent(content.toString("base64")).slice(0, 8);
  const { name, ext } = path.parse(srcPath);
  const filename = `${name}.${hash}${ext}`;
  const destPath = path.join(outdir, globalDir, filename);
  const destDir = path.dirname(destPath);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (!fs.existsSync(destPath)) {
    fs.copyFileSync(srcPath, destPath);
  }

  return `/${globalDir}/${filename}`;
};

const escapeAttr = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};
