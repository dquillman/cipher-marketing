#!/usr/bin/env node
// Inlines assets/shared.css, assets/site.js, and data/campaign-state.json into
// each HTML page in this directory. Run with: node inline-assets.mjs
//
// Idempotent — replaces existing inline blocks if present.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

const css = readFileSync(join(HERE, "assets/shared.css"), "utf8");
const js = readFileSync(join(HERE, "assets/site.js"), "utf8");
const state = readFileSync(join(HERE, "data/campaign-state.json"), "utf8");

const INLINE_OPEN = "<!--INLINE-ASSETS-->";
const INLINE_CLOSE = "<!--/INLINE-ASSETS-->";
const STATE_OPEN = "<!--INLINE-STATE-->";
const STATE_CLOSE = "<!--/INLINE-STATE-->";

const styleBlock =
  `${INLINE_OPEN}\n<style>\n${css}\n</style>\n${INLINE_CLOSE}`;

function jsBlock(includeState) {
  const stateScript = includeState
    ? `${STATE_OPEN}\n<script>window.__CAMPAIGN_STATE__ = ${state};</script>\n${STATE_CLOSE}\n`
    : "";
  return `${INLINE_OPEN}\n${stateScript}<script>\n${js}\n</script>\n${INLINE_CLOSE}`;
}

const STATE_PAGES = new Set(["today.html", "index.html"]);

// Skip files that already have their own self-contained styles
// (the legacy single-page rollup uses different class names).
const SKIP = new Set(["launch-campaign.html"]);

const files = readdirSync(HERE).filter(
  (f) => f.endsWith(".html") && statSync(join(HERE, f)).isFile() && !SKIP.has(f)
);

const LINK_TAG = '<link rel="stylesheet" href="assets/shared.css">';
const SCRIPT_TAG = '<script src="assets/site.js"></script>';

for (const f of files) {
  const path = join(HERE, f);
  let html = readFileSync(path, "utf8");
  const before = html;
  const includeState = STATE_PAGES.has(f);

  // Strip prior inline blocks (re-inlinable, leaves surrounding whitespace tidy)
  html = html.replace(
    new RegExp(`\\n?${INLINE_OPEN}[\\s\\S]*?${INLINE_CLOSE}\\n?`, "g"),
    "\n"
  );

  // Ensure the external <link> tag is present so the inline block has somewhere to attach.
  // (If a previous bad run stripped it, restore it before <body>.)
  if (!html.includes(LINK_TAG)) {
    html = html.replace(/<\/head>/, `${LINK_TAG}\n</head>`);
  }
  if (!html.includes(SCRIPT_TAG)) {
    html = html.replace(/<\/body>/, `${SCRIPT_TAG}\n</body>`);
  }

  // Inline CSS *after* the external <link> tag (link stays, inline block follows)
  html = html.replace(LINK_TAG, `${LINK_TAG}\n${styleBlock}`);

  // Inline JS *before* the external <script src> tag so the inline runs first
  html = html.replace(SCRIPT_TAG, `${jsBlock(includeState)}\n${SCRIPT_TAG}`);

  if (html !== before) {
    writeFileSync(path, html);
    console.log(`inlined: ${f}${includeState ? " (+state)" : ""}`);
  } else {
    console.log(`unchanged: ${f}`);
  }
}

// launch-campaign.html is now produced by build-app.mjs from the same source
// pages as app.html, so it always reflects current state. No external sync needed.

console.log(
  `\nDone. Re-run after editing shared.css, site.js, or campaign-state.json.\nThen run: node build-app.mjs  (produces app.html + launch-campaign.html)`
);
