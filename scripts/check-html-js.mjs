#!/usr/bin/env node
// Parses every inline <script> block in the deployed HTML pages.
//
// Why this exists: on 2026-08-01 a patch introduced a literal newline inside a
// JavaScript string, which is a syntax error. The whole script block failed to
// parse, so the Generate Video buttons, approve buttons, and publish kit were
// all dead — and it shipped to production, because "it deployed successfully"
// says nothing about whether the page's JavaScript runs.
//
// These pages carry thousands of lines of hand-edited inline JS with no build
// step, so nothing else catches this. Run before every hosting deploy.
//
// Usage:
//   node scripts/check-html-js.mjs
//   npm run check:js

import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Only files firebase.json actually serves.
const PAGES = [
  "site/app.html",
  "site/posts.html",
  "site/launch-campaign.html",
  "site/funnel.html",
  "site/sprint.html",
  "site/testimonials.html",
];

const SCRIPT_RE = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
let failures = 0;
let checked = 0;

for (const page of PAGES) {
  let html;
  try {
    html = readFileSync(page, "utf8");
  } catch {
    continue; // page not present in this checkout
  }
  let m;
  let idx = 0;
  SCRIPT_RE.lastIndex = 0;
  while ((m = SCRIPT_RE.exec(html)) !== null) {
    const code = m[1];
    idx++;
    if (!code.trim()) continue;
    checked++;
    // Line number of the block start, so a failure points into the real file.
    const startLine = html.slice(0, m.index).split("\n").length;
    const tmp = join(tmpdir(), `cipher-jscheck-${process.pid}-${idx}.js`);
    writeFileSync(tmp, code, "utf8");
    try {
      execFileSync(process.execPath, ["--check", tmp], { stdio: "pipe" });
    } catch (err) {
      failures++;
      const stderr = String(err.stderr || "");
      const detail = stderr.split("\n").find((l) => /SyntaxError|Error:/.test(l)) || "parse failed";
      // Offsets inside the block map back to the page by adding startLine.
      const inBlock = (stderr.match(/cipher-jscheck-[^:]+:(\d+)/) || [])[1];
      const where = inBlock ? `${page}:${startLine + Number(inBlock) - 1}` : `${page} (block ${idx})`;
      console.error(`  FAIL  ${where}\n        ${detail.trim()}`);
    } finally {
      try { unlinkSync(tmp); } catch {}
    }
  }
}

if (failures) {
  console.error(`\n${failures} inline script block(s) failed to parse — DO NOT DEPLOY.\n`);
  process.exitCode = 1;
} else {
  console.log(`\nAll ${checked} inline script blocks parse cleanly.\n`);
}
