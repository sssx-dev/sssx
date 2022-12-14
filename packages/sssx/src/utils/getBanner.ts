import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dayjs from 'dayjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJSON = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, `../../`, `package.json`), { encoding: 'utf-8' })
);

export const getBanner = () => {
  // const timestamp = dayjs().format(`YYYY-MM-DD HH:mm:ss`);
  const timestamp = dayjs().format(`YYYY-MM-DD-HH`);
  return `Generated by https://www.sssx.dev v${packageJSON.version} on ${timestamp}`;
};
