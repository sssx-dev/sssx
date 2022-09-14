import { SEPARATOR } from '../constants.js';

export const resolve = (path: string) => path.replaceAll(`/`, SEPARATOR);
