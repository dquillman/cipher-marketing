#!/usr/bin/env node
// Removes private campaign/post snapshots from static HTML artifacts.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const BLOCK = /\n?<!--INLINE-STATE-->[\s\S]*?<!--\/INLINE-STATE-->\n?/g;
let removed = 0;

for (const name of readdirSync(HERE)) {
  const path = join(HERE, name);
  if (!name.endsWith('.html') || !statSync(path).isFile()) continue;
  const before = readFileSync(path, 'utf8');
  const after = before.replace(BLOCK, '\n');
  if (after !== before) {
    writeFileSync(path, after, 'utf8');
    removed += 1;
    console.log('removed private inline state: ' + name);
  }
}

const app = readFileSync(join(HERE, 'app.html'), 'utf8');
if (/window\.__CAMPAIGN_STATE__\s*=\s*\{/.test(app) || /window\.__POSTS__\s*=\s*\{/.test(app)) {
  throw new Error('app.html still contains an inline private data snapshot');
}

console.log('private inline state check passed (' + removed + ' file(s) cleaned)');
