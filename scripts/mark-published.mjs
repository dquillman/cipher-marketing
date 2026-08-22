#!/usr/bin/env node
// Marks a post as published in posts.json after manual posting.
// Without this, post-performance-grader can't grade correctly (checks postedAt).
//
// Usage:
//   node scripts/mark-published.mjs <post-id> <post-url>
//   node scripts/mark-published.mjs li <post-url>        # today's LinkedIn post
//   node scripts/mark-published.mjs x  <post-url>        # today's X post
//
// Examples:
//   node scripts/mark-published.mjs li https://www.linkedin.com/feed/update/urn:li:activity:123/
//   node scripts/mark-published.mjs li-wed-2026-05-20-trap https://linkedin.com/...

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = join(HERE, "../site/data/posts.json");

// ---- Campaign clock: Central Time (moved off Mountain 2026-08-22) ----
// A real zone lookup, not a fixed offset, so CDT/CST handles itself.
function todayCT() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
}

// ---- Parse args ----
const [idOrAlias, postUrl] = process.argv.slice(2);

if (!idOrAlias || !postUrl) {
  console.error("Usage: node scripts/mark-published.mjs <post-id|li|x> <post-url>");
  console.error("  li  → today's LinkedIn scheduled post");
  console.error("  x   → today's X scheduled post");
  process.exit(1);
}

if (!postUrl.startsWith("http")) {
  console.error(`✗  post-url looks wrong: "${postUrl}" — expected https://...`);
  process.exit(1);
}

// ---- Load posts ----
const data = JSON.parse(readFileSync(POSTS_FILE, "utf8"));
const today = todayCT();

function findPost(alias) {
  // 1. Exact ID match
  const exact = data.posts.find((p) => p.id === alias);
  if (exact) return exact;

  // 2. Short aliases: "li" → today's linkedin, "x" → today's x
  const CHANNEL_MAP = { li: "linkedin", x: "x" };
  const channel = CHANNEL_MAP[alias.toLowerCase()];
  if (channel) {
    const match = data.posts.find(
      (p) => p.channel === channel && p.scheduled === today && p.status === "scheduled"
    );
    if (match) return match;
    // Fallback: nearest scheduled post on that channel regardless of date
    const fallback = data.posts
      .filter((p) => p.channel === channel && p.status === "scheduled")
      .sort((a, b) => a.scheduled.localeCompare(b.scheduled))[0];
    if (fallback) {
      console.warn(`⚠  No post scheduled for ${today} on ${channel} — using nearest: ${fallback.id}`);
      return fallback;
    }
  }

  return null;
}

const post = findPost(idOrAlias);

if (!post) {
  console.error(`✗  No post found matching "${idOrAlias}".`);
  console.error("   Available IDs:");
  data.posts.forEach((p) => console.error(`     ${p.id}  [${p.status}]`));
  process.exit(1);
}

if (post.status === "posted") {
  console.warn(`⚠  Post "${post.id}" is already marked posted.`);
  console.warn(`   postedAt: ${post.postedAt}`);
  console.warn(`   postUrl:  ${post.postUrl}`);
  process.exit(0);
}

// ---- Apply update ----
// NOTE: status must be "posted" (not "published") to match the dashboard
// filters in app.html / posts.html / schedule.html. "published" would make
// the post invisible to both the drafts and the awaiting-grading lists.
const now = new Date().toISOString();
post.status = "posted";
post.postedAt = now;
post.postUrl = postUrl;
data._meta.lastUpdatedAt = now;
data._meta.lastUpdatedBy = "mark-published";

writeFileSync(POSTS_FILE, JSON.stringify(data, null, 2) + "\n");

console.log(`✓  ${post.id}`);
console.log(`   channel:   ${post.channel}`);
console.log(`   scheduled: ${post.scheduledTimeLocal}`);
console.log(`   status:    posted`);
console.log(`   postedAt:  ${now}`);
console.log(`   postUrl:   ${postUrl}`);
console.log();
console.log("   Local posts.json updated. To reflect in the deployed dashboard:");
console.log("     node scripts/seed-firestore.mjs");
console.log("   (The seed script now preserves dashboard 'Mark Posted' clicks and grades.)");
