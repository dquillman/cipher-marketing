#!/usr/bin/env node
// Deploy gate for post links. The rule itself lives in scripts/lib/post-links.mjs
// (shared with scripts/post-copy.mjs) — read that file for why it exists.
//
// Usage:
//   node scripts/check-post-links.mjs            # fails on unshipped posts
//   node scripts/check-post-links.mjs --audit    # also lists posted offenders

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FIX_HINT, isStub, linkProblems } from "./lib/post-links.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const posts = JSON.parse(
  readFileSync(join(HERE, "../site/data/posts.json"), "utf8"),
).posts;

const audit = process.argv.includes("--audit");

const failures = [];
const stubs = [];
const history = [];

for (const p of posts) {
  const problems = linkProblems(p);
  if (!problems.length) continue;

  // Already live. Editing posts.json changes nothing for the people who read
  // it; these are evidence, not work items.
  if (p.status === "posted" || p.status === "skipped") {
    history.push(`${p.id} (${p.status}): ${problems.join("; ")}`);
    continue;
  }
  if (isStub(p)) { stubs.push(p.id); continue; }

  for (const problem of problems) failures.push(`${p.id}: ${problem}`);
}

if (failures.length) {
  console.error("x  post link check failed:\n");
  for (const f of failures) console.error("   - " + f);
  console.error("\n   " + FIX_HINT.replace(/\n/g, "\n   ") + "\n");
  process.exit(1);
}

if (stubs.length) console.log(`-  not drafted yet (copy and cta still owed): ${stubs.join(", ")}`);
if (audit && history.length) {
  console.log(`\nalready shipped with this problem (${history.length}) — history, not work:`);
  for (const h of history) console.log("   - " + h);
  console.log();
}
const checked = posts.filter((p) => p.status !== "posted" && p.status !== "skipped").length;
console.log(`ok  post link check: ${checked} unshipped posts, every link in the right place.`);
