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

// ---- Mountain Daylight Time (UTC-6, May–Nov) ----
function todayMT() {
  return new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().slice(0, 10);
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
const today = todayMT();

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

if (post.status === "published") {
  console.warn(`⚠  Post "${post.id}" is already marked published.`);
  console.warn(`   postedAt: ${post.postedAt}`);
  console.warn(`   postUrl:  ${post.postUrl}`);
  process.exit(0);
}

// ---- Apply update ----
const now = new Date().toISOString();
post.status = "published";
post.postedAt = now;
post.postUrl = postUrl;
data._meta.lastUpdatedAt = now;

writeFileSync(POSTS_FILE, JSON.stringify(data, null, 2) + "\n");

console.log(`✓  ${post.id}`);
console.log(`   channel:   ${post.channel}`);
console.log(`   scheduled: ${post.scheduledTimeLocal}`);
console.log(`   postedAt:  ${now}`);
console.log(`   postUrl:   ${postUrl}`);
console.log();
console.log("   Run 'npm run build' to reflect in dashboard, or it will auto-rebuild if you're in Claude Code.");
