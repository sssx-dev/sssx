/**
 * SSSX Theme definition.
 *
 * A theme provides default layout, styles, and optional components
 * that can be used across a project.
 */
export interface SSSXTheme {
  /** Theme name */
  name: string;

  /** Theme version (semver) */
  version: string;

  /** Path to the default layout component (+layout.svelte) */
  layout?: string;

  /** Path to global CSS file(s) to inject */
  styles?: string[];

  /** Head tags to inject on every page */
  head?: string[];

  /**
   * Named partial components that pages can reference.
   * e.g. { header: "./components/Header.svelte", footer: "./components/Footer.svelte" }
   */
  components?: Record<string, string>;

  /**
   * Default frontmatter/config values for the theme.
   * These can be overridden per-page.
   */
  defaults?: Record<string, any>;
}

/**
 * Load a theme from a package or path.
 * Themes export a default SSSXTheme object.
 */
export const loadTheme = async (themePathOrPackage: string): Promise<SSSXTheme> => {
  try {
    const module = await import(themePathOrPackage);
    const theme: SSSXTheme = module.default || module;

    if (!theme.name) {
      throw new Error(`Theme at "${themePathOrPackage}" must export a "name" property.`);
    }

    return theme;
  } catch (err) {
    throw new Error(
      `Failed to load theme "${themePathOrPackage}": ${err instanceof Error ? err.message : String(err)}`
    );
  }
};

/**
 * Merge theme head tags with page head tags.
 * Theme tags come first, page tags can override.
 */
export const mergeThemeHead = (themeHead: string[] = [], pageHead: string = ""): string => {
  return [...themeHead, pageHead].filter(Boolean).join("\n");
};
