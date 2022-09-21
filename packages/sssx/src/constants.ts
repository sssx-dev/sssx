export const SVELTEJS = `svelte.js`;
export const DYNAMIC_NAME = 'dynamic';
export const isWin = process.platform === 'win32';
export const SEPARATOR = isWin ? '\\' : '/';
export const NEWLINE = `\n`;

export const IMPORT_REGEX =
  /import\s+?(?:(?:(?:[\w*\s{},]*)\s+from\s+?)|)(?:(?:".*?")|(?:'.*?'))[\s]*?(?:;|$|)/gi;
