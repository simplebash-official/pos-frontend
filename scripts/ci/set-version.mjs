#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const newVersion = process.argv[2];
if (!newVersion || !/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('usage: node set-version.mjs <major.minor.patch>');
  process.exit(1);
}

const pkgPath = fileURLToPath(new URL('../../package.json', import.meta.url));
const src = readFileSync(pkgPath, 'utf-8');
const regex = /("version":\s*)"[^"]*"/;
if (!regex.test(src)) {
  console.error(`error: version string not found in ${pkgPath}`);
  process.exit(1);
}

const replaced = src.replace(regex, `$1"${newVersion}"`);
writeFileSync(pkgPath, replaced, 'utf-8');
console.log(`package.json -> ${newVersion}`);
