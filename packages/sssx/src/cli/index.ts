#!/usr/bin/env node
import { execFile } from 'child_process';
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const cwd = process.cwd();
const cliPath = __dirname + 'cli.js';

console.log('===sssx===', {
  __dirname,
  __filename,
  cwd,
  cliPath
});

// import(__dirname + 'cli.js');
const cli = execFile(`node ${cliPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});
