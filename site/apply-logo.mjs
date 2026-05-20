// One-off: replace the "CipherExam Campaign" nav text with the logo image,
// and add a favicon link to <head>. Idempotent.
//
// Run with: node site/apply-logo.mjs

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

const NAV_OLD = '<a class="nav-brand" href="index.html">CipherExam Campaign</a>';
const NAV_NEW = '<a class="nav-brand" href="index.html" aria-label="CipherExam"><img src="assets/logo.svg" alt="CipherExam" height="32" style="display:block;"></a>';

const FAVICON_TAG = '<link rel="icon" type="image/svg+xml" href="assets/logo-mark.svg">';

const files = readdirSync(HERE).filter(
  (f) => f.endsWith(".html") && statSync(join(HERE, f)).isFile()
);

for (const f of files) {
  const path = join(HERE, f);
  let html = readFileSync(path, "utf8");
  const before = html;

  if (html.includes(NAV_OLD)) {
    html = html.replace(NAV_OLD, NAV_NEW);
  }

  if (!html.includes('rel="icon"')) {
    html = html.replace(/<\/head>/, `${FAVICON_TAG}\n</head>`);
  }

  if (html !== before) {
    writeFileSync(path, html);
    console.log(`updated: ${f}`);
  } else {
    console.log(`unchanged: ${f}`);
  }
}
