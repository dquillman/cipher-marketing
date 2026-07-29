#!/usr/bin/env node
// Inlines shared presentation assets and the authenticated Firebase bootstrap into
// each HTML page in this directory. Run with: node inline-assets.mjs
//
// Idempotent — replaces existing inline blocks if present.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

const css = readFileSync(join(HERE, "assets/shared.css"), "utf8");
const js = readFileSync(join(HERE, "assets/site.js"), "utf8");

const INLINE_OPEN = "<!--INLINE-ASSETS-->";
const INLINE_CLOSE = "<!--/INLINE-ASSETS-->";

// Firebase config — embedded so no env var needed for a personal tool.
const FB_INIT = `
<script src="https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.14.0/firebase-auth-compat.js"></script>
<script>
(function(){
  var cfg={apiKey:"AIzaSyDDSPC14tdDzMfkDrYLFykg2CFOZK9B4Ts",authDomain:"cipher-marketing-daveq.firebaseapp.com",projectId:"cipher-marketing-daveq"};
  if(!firebase.apps.length)firebase.initializeApp(cfg);
  window._cipherDb=firebase.firestore();
  window._cipherAuth=firebase.auth();
})();
</script>
<script src="assets/operator-auth.js"></script>`.trim();

// Private campaign/post data is never embedded in static HTML. Authenticated
// Firestore listeners populate it after the operator claim is verified.
function styleBlock() {
  return `${INLINE_OPEN}\n<style>\n${css}\n</style>\n${FB_INIT}\n${INLINE_CLOSE}`;
}


function jsBlock() {
  return `${INLINE_OPEN}\n<script>\n${js}\n</script>\n${INLINE_CLOSE}`;
}


// Skip files that already have their own self-contained styles
// (the legacy single-page rollup uses different class names).
//
// app.html is also skipped by default: it is HAND-EDITED and its INLINE-ASSETS
// blocks carry load-bearing direct edits (verified 2026-06-01: processing it
// deleted ~838 lines). Use scripts/refresh-inline-state.mjs to refresh only its
// state block. --force includes it — only for an intentional rebuild.
const FORCE = process.argv.includes("--force");
// funnel.html and sprint.html are standalone hand-authored pages (their own
// .topbar/.nav + inlined assets). Processing sprint.html once destroyed its body
// (unbalanced INLINE-ASSETS markers → the strip regex ate the content), so they
// are always skipped like app.html and load HAL via a hand-maintained tag.
const SKIP = new Set(["launch-campaign.html", "funnel.html", "sprint.html", ...(FORCE ? [] : ["app.html"])]);
if (!FORCE) {
  console.log("note: skipping app.html (hand-edited — processing it deletes direct edits; --force overrides)");
}

const files = readdirSync(HERE).filter(
  (f) => f.endsWith(".html") && statSync(join(HERE, f)).isFile() && !SKIP.has(f)
);

const LINK_TAG = '<link rel="stylesheet" href="assets/shared.css">';
const SCRIPT_TAG = '<script src="assets/site.js"></script>';

for (const f of files) {
  const path = join(HERE, f);
  let html = readFileSync(path, "utf8");
  const before = html;

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
  // Inline shared CSS and Firebase/Auth bootstrap after the external link.
  html = html.replace(LINK_TAG, `${LINK_TAG}\n${styleBlock()}`);

  // Replace the external <script src="assets/site.js"> with the inline JS block.
  // Loading both inline + external would re-declare top-level `let CAMPAIGN_START`
  // (and others) → SyntaxError at parse time → handlers never register.
  if (html.includes(SCRIPT_TAG)) {
    html = html.replace(SCRIPT_TAG, jsBlock());
  } else {
    html = html.replace(/<\/body>/, `${jsBlock()}\n</body>`);
  }

  // Inject the shared HAL rail on every page (idempotent — strip prior block first).
  // Single source of truth is assets/hal-rail.js. app.html is excluded from this
  // pass (its hand-edited inline CSS/JS), but references the same external file
  // directly via a <!--HAL-RAIL--> tag maintained by hand.
  const HAL_OPEN = "<!--HAL-RAIL-->", HAL_CLOSE = "<!--/HAL-RAIL-->";
  html = html.replace(new RegExp(`\\n?${HAL_OPEN}[\\s\\S]*?${HAL_CLOSE}\\n?`, "g"), "\n");
  const halBlock = `${HAL_OPEN}\n<script src="assets/hal-rail.js"></script>\n${HAL_CLOSE}`;
  if (html.includes("</body>")) html = html.replace("</body>", `${halBlock}\n</body>`);

  if (html !== before) {
    writeFileSync(path, html);
    console.log(`inlined: ${f}`);
  } else {
    console.log(`unchanged: ${f}`);
  }
}

// launch-campaign.html is now produced by build-app.mjs from the same source
// pages as app.html, so it always reflects current state. No external sync needed.

console.log(
  `\nDone. Re-run after editing shared.css or site.js.\nThen run: node build-app.mjs  (validates app.html and produces launch-campaign.html)`
);
