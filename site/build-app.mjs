#!/usr/bin/env node
// Builds a single-file SPA `app.html` from the 7 per-page HTML files.
// Each page's <main class="wrap">…</main> becomes a <section data-route="X">.
// Hash-based router (#today, #dashboard, etc.) shows one section at a time.
//
// Re-run after editing any of the source pages, or after running inline-assets.mjs.
// Run with: node build-app.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

const ROUTES = [
  { file: "today.html",       route: "today",       label: "Today" },
  { file: "index.html",       route: "dashboard",   label: "Dashboard" },
  { file: "posts.html",       route: "posts",       label: "Posts" },
  { file: "strategy.html",    route: "strategy",    label: "Strategy" },
  { file: "content.html",     route: "content",     label: "Content" },
  { file: "landing.html",     route: "landing",     label: "Landing" },
  { file: "engineering.html", route: "engineering", label: "Engineering" },
  { file: "voice.html",       route: "voice",       label: "Voice" },
];

const FILE_TO_ROUTE = Object.fromEntries(ROUTES.map(r => [r.file, r.route]));

// ---- Extract <main class="wrap">…</main> body from each page ----
function extractMain(html) {
  const m = html.match(/<main class="wrap">([\s\S]*?)<\/main>/);
  if (!m) throw new Error("no <main class=\"wrap\"> block found");
  return m[1];
}

// ---- Rewrite ALL intra-site links to cipherShow() calls (no hash routing) ----
const ROUTE_NAMES = ROUTES.map(r => r.route);

function rewriteLinks(html) {
  // 1. <a href="today.html"> or <a href="landing.html#pmp"> → onclick=cipherShow
  html = html.replace(/href="([a-z][a-z0-9-]*\.html)(#[a-z0-9-]+)?"/gi, (full, file) => {
    const route = FILE_TO_ROUTE[file];
    if (!route) return full;
    return `href="#" onclick="cipherShow('${route}');return false;"`;
  });

  // 2. <a href="#today"> etc. (route hashes from prior build) → onclick=cipherShow
  html = html.replace(/href="#([a-z][a-z0-9-]*)"/gi, (full, hash) => {
    if (ROUTE_NAMES.includes(hash)) {
      return `href="#" onclick="cipherShow('${hash}');return false;"`;
    }
    return full; // leave non-route anchors (sub-section anchors) alone
  });

  // 3. <a href="../00-campaign-brief.md">...</a> → strip the link, keep the text
  //    The raw .md files are outside the server root, so links can't resolve.
  html = html.replace(
    /<a\s+[^>]*href="\.\.?\/[0-9]{2}-[a-z-]+\.md(?:#[a-z0-9-]+)?"[^>]*>([\s\S]*?)<\/a>/gi,
    (_full, text) => text
  );

  return html;
}

// ---- Read all 7 source pages ----
const pages = ROUTES.map(r => {
  const html = readFileSync(join(HERE, r.file), "utf8");
  return { ...r, html };
});

// ---- Use today.html as the template (it already has inline CSS / JS / state) ----
const tpl = pages.find(p => p.route === "today").html;

// ---- Build the nav: buttons (NOT links) so no hash navigation quirks ----
const navBtnsHtml = ROUTES.map(r =>
  `      <button class="nav-link" type="button" data-route="${r.route}" onclick="cipherShow('${r.route}')">${r.label}</button>`
).join("\n");

const newNav = `<nav class="nav">
  <div class="nav-inner">
    <a class="nav-brand" href="#" onclick="cipherShow('today');return false;">CipherExam Campaign</a>
    <div class="nav-links">
${navBtnsHtml}
    </div>
    <a class="nav-rollup" href="launch-campaign.html" target="_blank" rel="noopener">Full rollup ↗</a>
  </div>
</nav>`;

// ---- Combined <main>. Today is "active" (visible) by default; others have
//      class="route-section" only — CSS hides them. No `hidden` attribute,
//      no `:target` selectors, no hashchange. Pure class-driven. ----
const sectionsHtml = pages.map(p => {
  const inner = rewriteLinks(extractMain(p.html));
  const activeClass = p.route === "today" ? " active" : "";
  return `<section class="route-section${activeClass}" data-route="${p.route}">\n${inner}\n</section>`;
}).join("\n\n");

const newMain = `<main class="wrap">\n${sectionsHtml}\n</main>`;

// ---- The tiny tab switcher. Inline at top of body so it's defined before
//      any onclick handler fires. No DOMContentLoaded dependency. ----
const routerScript = `<script>
// Defined immediately so the nav's onclick handlers work the moment the page renders.
function cipherShow(route) {
  var ok = false;
  var secs = document.getElementsByClassName('route-section');
  for (var i = 0; i < secs.length; i++) {
    if (secs[i].getAttribute('data-route') === route) {
      secs[i].classList.add('active');
      ok = true;
    } else {
      secs[i].classList.remove('active');
    }
  }
  if (!ok) return; // unknown route — leave page alone
  var links = document.getElementsByClassName('nav-link');
  for (var j = 0; j < links.length; j++) {
    if (links[j].getAttribute('data-route') === route) {
      links[j].classList.add('current');
    } else {
      links[j].classList.remove('current');
    }
  }
  document.title = ({
    today:       'Today — CipherExam Campaign',
    dashboard:   'Dashboard — CipherExam Campaign',
    posts:       'Posts — CipherExam Campaign',
    strategy:    'Strategy — CipherExam Campaign',
    content:     'Content — CipherExam Campaign',
    landing:     'Landing — CipherExam Campaign',
    engineering: 'Engineering — CipherExam Campaign',
    voice:       'Voice — CipherExam Campaign'
  })[route] || 'CipherExam Campaign';
  window.scrollTo(0, 0);
}
</script>`;

// ---- Assemble: swap nav+main, inject the switcher inline BEFORE the nav
//      so cipherShow() is defined the instant the onclick handlers exist. ----
let out = tpl
  .replace(/<nav class="nav">[\s\S]*?<\/nav>/, routerScript + "\n" + newNav)
  .replace(/<main class="wrap">[\s\S]*?<\/main>/, newMain)
  .replace(/<title>[^<]*<\/title>/, "<title>CipherExam Campaign</title>");

writeFileSync(join(HERE, "app.html"), out);
console.log("built app.html (" + out.length + " bytes, " + ROUTES.length + " routes)");

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
    <a class="nav-brand" href="#top">CipherExam Campaign — Full Rollup</a>
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
  .replace(/<\/head>/, rollupExtraCss + "\n</head>");

writeFileSync(join(HERE, "launch-campaign.html"), rollupOut);
console.log("built launch-campaign.html (" + rollupOut.length + " bytes, " + ROUTES.length + " sections, linear scroll)");
