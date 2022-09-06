const isWin = process.platform === 'win32';
export const SEPARATOR = isWin ? '\\' : '/';

export const resolve = (path: string) => path.replaceAll(`/`, SEPARATOR);
