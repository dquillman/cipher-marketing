#!/usr/bin/env node
// Prints today's ready-to-paste post copy from posts.json.
//
// Usage:
//   node scripts/post-copy.mjs                        # today (CT)
//   node scripts/post-copy.mjs --date 2026-05-20      # specific date
//   node scripts/post-copy.mjs --platform linkedin     # filter to one platform
//   node scripts/post-copy.mjs --platform x

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FIX_HINT, linkProblems } from "./lib/post-links.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = join(HERE, "../site/data/posts.json");

// ---- Parse CLI args ----
const args = process.argv.slice(2);
let targetDate = null;
let platformFilter = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--date" && args[i + 1]) targetDate = args[++i];
  if (args[i] === "--platform" && args[i + 1]) platformFilter = args[++i].toLowerCase();
}

// ---- Campaign clock: Central Time (moved off Mountain 2026-08-22) ----
// A real zone lookup, not a fixed offset, so CDT/CST handles itself.
function todayCT() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
}

if (!targetDate) targetDate = todayCT();

// ---- Load posts ----
const { posts } = JSON.parse(readFileSync(POSTS_FILE, "utf8"));

const matches = posts.filter(
  (p) =>
    p.scheduled === targetDate &&
    p.status === "scheduled" &&
    (!platformFilter || p.channel === platformFilter)
);

if (matches.length === 0) {
  const qualifier = platformFilter ? ` (${platformFilter})` : "";
  console.log(`No scheduled posts for ${targetDate}${qualifier}.`);
  console.log(`Check posts.json or try: node scripts/post-copy.mjs --date YYYY-MM-DD`);
  process.exit(0);
}

const LABELS = { linkedin: "LinkedIn", x: "X (Twitter)" };
const LINE = "─".repeat(62);

// Last gate before the copy reaches the clipboard. A post that breaks the link
// rule must not be printed as paste-ready — printing it is what shipped
// li-volume-metric and li-cognitive-levels with a bare cipherexam.com in the
// body, and both landed in the bottom third of the corpus.
const blocked = matches.flatMap((p) => linkProblems(p).map((problem) => `${p.id}: ${problem}`));
if (blocked.length) {
  console.error("x  not printing — these posts break the link rule:\n");
  for (const b of blocked) console.error("   - " + b);
  console.error("\n   " + FIX_HINT.replace(/\n/g, "\n   ") + "\n");
  process.exit(1);
}

for (const p of matches) {
  const platform = LABELS[p.channel] || p.channel;
  console.log("\n" + LINE);
  console.log(`  ${platform}  ·  ${p.scheduledTimeLocal}  ·  hook: ${p.hook}`);
  console.log(`  Video: ${p.video}  [${p.videoFormat}]`);
  console.log(LINE);
  console.log();
  console.log(p.copy);
  console.log();
  if (p.cta) {
    console.log(`  CTA: ${p.cta}`);
  }
}

console.log("\n" + LINE);
console.log(`  ${matches.length} post(s) for ${targetDate}`);
console.log(LINE + "\n");
