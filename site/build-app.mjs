#!/usr/bin/env node
// Validates the canonical hand-maintained `app.html` and builds the linear
// `launch-campaign.html` rollup from the per-page HTML files.
// Each page's <main class="wrap">…</main> becomes a <section data-route="X">.
// Hash-based router (#today, #dashboard, etc.) shows one section at a time.
//
// Re-run after editing any of the source pages, or after running inline-assets.mjs.
// Run with: node build-app.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const { version: APP_VERSION } = JSON.parse(readFileSync(join(HERE, "../package.json"), "utf8"));

const ROUTES = [
  { file: "today.html",       route: "today",       label: "Today" },
  { file: "index.html",       route: "dashboard",   label: "Dashboard" },
  { file: "schedule.html",    route: "schedule",    label: "Schedule" },
  { file: "posts.html",       route: "posts",       label: "Posts" },
  { file: "strategy.html",    route: "strategy",    label: "Strategy" },
  { file: "content.html",     route: "content",     label: "Content" },
  { file: "landing.html",     route: "landing",     label: "Landing" },
  { file: "engineering.html", route: "engineering", label: "Engineering" },
  { file: "voice.html",       route: "voice",       label: "Voice" },
  { file: "competitors.html", route: "competitors", label: "Competitors" },
  { file: "outreach.html",    route: "outreach",    label: "Outreach" },
  { file: "testimonials.html", route: "testimonials", label: "Testimonials" },
];

const FILE_TO_ROUTE = Object.fromEntries(ROUTES.map(r => [r.file, r.route]));

// ---- Extract <main class="wrap">…</main> body from each page ----
function extractMain(html) {
  const m = html.match(/<main class="wrap">([\s\S]*?)<\/main>/);
  if (!m) throw new Error("no <main class=\"wrap\"> block found");
  return m[1];
}

// ---- Read all source pages ----
const pages = ROUTES.map(r => {
  const html = readFileSync(join(HERE, r.file), "utf8");
  return { ...r, html };
});

// ---- Use today.html as the template (it already has inline CSS / JS / state) ----
const tpl = pages.find(p => p.route === "today").html;

// app.html is the canonical deployed dashboard and is never generated. This
// permanently removes the destructive path that previously erased features.
const REQUIRED_APP_MARKERS = ["cc-title", "sched-row", "reddit-organic", "cipherHelp", "hal-rail.js", "operator-auth.js"];
const existingApp = readFileSync(join(HERE, "app.html"), "utf8");
const missingMarkers = REQUIRED_APP_MARKERS.filter(marker => !existingApp.includes(marker));
if (missingMarkers.length > 0) {
  throw new Error("app.html is missing required features: " + missingMarkers.join(", "));
}
console.log("validated canonical app.html (preserved; never generated)");



// ============================================================================
// ROLLUP BUILD — launch-campaign.html
// Same source pages, but linear-scroll instead of tabbed. All sections stacked
// and visible. Nav becomes a TOC of hash anchors that scroll to each section.
// ============================================================================

// For rollup: route-to-route links stay as hash anchors (#today, #strategy, …)
// so the browser scrolls to them natively. NO cipherShow rewriting.
function rewriteLinksForRollup(html) {
  // 1. <a href="today.html">  →  <a href="#today">
  html = html.replace(/href="([a-z][a-z0-9-]*\.html)(#[a-z0-9-]+)?"/gi, (full, file, sub) => {
    const route = FILE_TO_ROUTE[file];
    if (!route) return full;
    return `href="#${route}"`;
  });

  // 2. Strip stale onclick="cipherShow(...)" attributes that might exist
  //    in the source pages from a prior app-build pass.
  html = html.replace(/\s+onclick="cipherShow\([^"]*\);?\s*return\s+false;?"/gi, "");

  // 3. Markdown file references → strip the link, keep the text.
  html = html.replace(
    /<a\s+[^>]*href="\.\.?\/[0-9]{2}-[a-z-]+\.md(?:#[a-z0-9-]+)?"[^>]*>([\s\S]*?)<\/a>/gi,
    (_full, text) => text
  );

  return html;
}

// TOC nav: anchor links that scroll. No buttons, no cipherShow.
const tocLinksHtml = ROUTES.map(r =>
  `      <a class="nav-link" href="#${r.route}">${r.label}</a>`
).join("\n");

const rollupNav = `<nav class="nav">
  <div class="nav-inner">
    <a class="nav-brand" href="#top" aria-label="CipherExam"><img src="assets/logo.svg" alt="CipherExam" height="32" style="display:block;vertical-align:middle;"> <span style="vertical-align:middle;margin-left:10px;color:var(--dim);font-weight:500;">— Full Rollup</span></a>
    <div class="nav-links">
${tocLinksHtml}
    </div>
    <a class="nav-rollup" href="app.html">Tabbed view ↗</a>
  </div>
</nav>`;

// Sections stacked with id=route so anchor links scroll to them.
// scroll-margin-top accounts for the sticky nav.
const rollupSectionsHtml = pages.map(p => {
  const inner = rewriteLinksForRollup(extractMain(p.html));
  return `<section id="${p.route}" class="rollup-section">
  <header class="rollup-section-head">
    <div class="rollup-eyebrow">Section</div>
    <h2 class="rollup-title">${p.label}</h2>
  </header>
${inner}
</section>`;
}).join("\n\n<hr class=\"rollup-divider\">\n\n");

const rollupMain = `<main class="wrap" id="top">
${rollupSectionsHtml}
</main>`;

// Inline style for rollup-specific tweaks (everything else comes from shared.css inlined in the template).
const rollupExtraCss = `<style>
  .rollup-section { scroll-margin-top: 80px; padding-top: 12px; }
  .rollup-section-head { margin: 0 0 24px; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
  .rollup-eyebrow { font-family: 'Satoshi', system-ui, sans-serif; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--purple); margin-bottom: 4px; }
  .rollup-title { font-family: 'Satoshi', system-ui, sans-serif; font-size: 2rem; font-weight: 800; margin: 0; letter-spacing: -0.01em; }
  .rollup-divider { border: none; border-top: 1px solid var(--border); margin: 56px 0 36px; }
</style>`;

// Build the rollup HTML by swapping nav+main and adding rollup CSS.
// No router script needed — browsers handle hash anchors natively.
let rollupOut = tpl
  .replace(/<nav class="nav">[\s\S]*?<\/nav>/, rollupNav)
  .replace(/<main class="wrap">[\s\S]*?<\/main>/, rollupMain)
  .replace(/<title>[^<]*<\/title>/, "<title>CipherExam Campaign — Full Rollup</title>")
  .replace(/<\/head>/, '<link rel="stylesheet" href="assets/outreach.css?v=' + APP_VERSION + '">\n' + rollupExtraCss + "\n</head>")
  .replace(/<\/body>/, '<script src="assets/outreach-data.js?v=' + APP_VERSION + '"><\/script>\n<script src="assets/outreach.js?v=' + APP_VERSION + '"><\/script>\n</body>');

writeFileSync(join(HERE, "launch-campaign.html"), rollupOut);
console.log("built launch-campaign.html (" + rollupOut.length + " bytes, " + ROUTES.length + " sections, linear scroll)");
