import fs from "node:fs";
import path from "node:path";
import { globby } from "globby";
import { hashContent } from "../utils/hashContent.ts";
import { type Config } from "../config.ts";
import { globEscape } from "../utils/globEscape.ts";

/**
 * Image pipeline for content images.
 *
 * Scans content directories for images, copies them with content-hashed
 * filenames to the output, and generates an image map that routes can use
 * to reference the correct paths.
 *
 * Supports:
 * - Content-hashed filenames for cache busting
 * - Image manifest/map for templates to resolve paths
 * - Grouping images per content entry
 *
 * Note: For actual format conversion (WebP/AVIF) and resizing, users should
 * add sharp or similar as a plugin. This pipeline handles the mapping and
 * file management layer.
 */

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "avif", "svg"];
const IMAGE_GLOB = `**/*.{${IMAGE_EXTENSIONS.join(",")}}`;

export interface ImageEntry {
  /** Original source path relative to content dir */
  src: string;
  /** Output path relative to outdir */
  out: string;
  /** Public URL path */
  publicPath: string;
  /** Content hash */
  hash: string;
  /** File size in bytes */
  size: number;
  /** Original filename */
  name: string;
  /** Extension without dot */
  ext: string;
}

export interface ImageMap {
  /** Map of original relative path → ImageEntry */
  images: Record<string, ImageEntry>;
}

/**
 * Scan a content directory for images and create a map.
 */
export const scanContentImages = async (
  contentDir: string
): Promise<Record<string, string>> => {
  const escaped = globEscape(contentDir);
  const files = await globby(`${escaped}/${IMAGE_GLOB}`);
  const map: Record<string, string> = {};

  for (const file of files) {
    const relative = file.replace(contentDir, "");
    map[relative] = file;
  }

  return map;
};

/**
 * Process images from a content directory into the output directory.
 *
 * - Copies with content-hashed filenames
 * - Generates an image map for template resolution
 * - Returns the map of original path → public path
 */
export const processContentImages = async (
  contentDir: string,
  outdir: string,
  config: Config
): Promise<ImageMap> => {
  const imageDir = path.join(outdir, config.globalDir || "global", "images");
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  const sourceImages = await scanContentImages(contentDir);
  const imageMap: ImageMap = { images: {} };

  for (const [relativePath, absolutePath] of Object.entries(sourceImages)) {
    const content = fs.readFileSync(absolutePath);
    const hash = hashContent(content.toString("base64"), "sha256", 8);
    const parsed = path.parse(relativePath);
    const hashedName = `${parsed.name}.${hash}${parsed.ext}`;
    const outPath = path.join(imageDir, hashedName);
    const publicPath = `/${config.globalDir || "global"}/images/${hashedName}`;

    if (!fs.existsSync(outPath)) {
      fs.copyFileSync(absolutePath, outPath);
    }

    const stat = fs.statSync(absolutePath);

    imageMap.images[relativePath] = {
      src: relativePath,
      out: outPath,
      publicPath,
      hash,
      size: stat.size,
      name: parsed.name,
      ext: parsed.ext.slice(1),
    };
  }

  return imageMap;
};

/**
 * Write the image map as JSON for templates/components to consume.
 */
export const writeImageMap = (outdir: string, imageMap: ImageMap) => {
  const mapPath = path.join(outdir, "_images.json");
  fs.writeFileSync(mapPath, JSON.stringify(imageMap, null, 2), "utf8");
};

/**
 * Resolve an image reference from a content file to its public path.
 * Handles both relative paths (./image.jpg) and content-relative paths.
 */
export const resolveContentImage = (
  imagePath: string,
  contentFile: string,
  imageMap: ImageMap
): string | undefined => {
  // Try as relative to content file
  const contentDir = path.dirname(contentFile);
  const normalized = path.normalize(path.join(contentDir, imagePath));

  // Try to match against map keys
  for (const [key, entry] of Object.entries(imageMap.images)) {
    if (normalized.endsWith(key) || key.endsWith(imagePath)) {
      return entry.publicPath;
    }
  }

  return undefined;
};

/**
 * Get image entries grouped by content directory.
 * Useful for providing images to templates.
 */
export const getImagesForRoute = (
  contentFile: string,
  imageMap: ImageMap
): ImageEntry[] => {
  const contentDir = path.dirname(contentFile);
  return Object.values(imageMap.images).filter((entry) =>
    entry.src.startsWith(contentDir.split("content").pop() || "")
  );
};
