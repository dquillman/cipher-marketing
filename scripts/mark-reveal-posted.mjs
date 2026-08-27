#!/usr/bin/env node
// Records that a gated post's promised answer reveal went live in its comments.
//
// Why this exists: the `cipher-reveal-due` scheduled task decides whether a
// reveal is still owed by reading `firstCommentPostedAt` off campaign/posts in
// FIRESTORE. Nothing wrote that field, so every run fell through to a live
// Chrome check — and when Chrome is signed out that task is told to push
// anyway, which means a false "reveal owed" alarm for a reveal already posted.
//
// Note the two comments are NOT the same thing and have separate fields:
//   ctaComment  / ctaCommentPostedAt    the CTA, posted with the post
//   firstComment / firstCommentPostedAt  the answer reveal, posted next morning
// Conflating them is how `revealPostedAt` got written on 2026-08-27, a field
// name nothing reads.
//
// Usage:
//   node scripts/mark-reveal-posted.mjs <post-id> [YYYY-MM-DD]
//   node scripts/mark-reveal-posted.mjs <post-id> --dry
//
// Date defaults to today in Central Time (the campaign clock).

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = join(HERE, "../site/data/posts.json");

const todayCT = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const [postId, maybeDate] = args.filter((a) => a !== "--dry");

if (!postId) {
  console.error("Usage: node scripts/mark-reveal-posted.mjs <post-id> [YYYY-MM-DD] [--dry]");
  process.exit(1);
}

const when = maybeDate || todayCT();
if (!/^\d{4}-\d{2}-\d{2}$/.test(when)) {
  console.error(`x  date looks wrong: "${when}" - expected YYYY-MM-DD`);
  process.exit(1);
}

let db;
try {
  db = await getDb();
} catch (err) {
  console.error(`x  ${err.message}`);
  console.error(credentialHelp());
  process.exit(1);
}

const ref = db.doc("campaign/posts");
const snap = await ref.get();
if (!snap.exists) {
  console.error("x  campaign/posts does not exist in Firestore");
  process.exit(1);
}

const remote = snap.data() || {};
const posts = Array.isArray(remote.posts) ? remote.posts : [];
const target = posts.find((p) => p.id === postId);

if (!target) {
  console.error(`x  no post "${postId}" in Firestore campaign/posts`);
  process.exit(1);
}
if (!target.firstComment) {
  console.error(`x  "${postId}" has no firstComment - there is no reveal to mark as posted`);
  process.exit(1);
}
if (target.firstCommentPostedAt) {
  console.log(`already marked: ${postId} firstCommentPostedAt = ${target.firstCommentPostedAt}`);
  if (target.firstCommentPostedAt === when) process.exit(0);
  console.log(`overwriting with ${when}`);
}

if (dry) {
  console.log(`[dry] would set firstCommentPostedAt = ${when} on ${postId}`);
  console.log(`[dry] reveal text starts: ${String(target.firstComment).slice(0, 80)}...`);
  process.exit(0);
}

target.firstCommentPostedAt = when;
await ref.set({ ...remote, posts }, { merge: true });
console.log(`firestore  ${postId}.firstCommentPostedAt = ${when}`);

// Mirror into the local file so the repo and Firestore agree.
try {
  const local = JSON.parse(readFileSync(POSTS_FILE, "utf8"));
  const lp = (local.posts || []).find((p) => p.id === postId);
  if (lp) {
    lp.firstCommentPostedAt = when;
    delete lp.revealPostedAt; // the dead field name
    writeFileSync(POSTS_FILE, JSON.stringify(local, null, 2) + "\n");
    console.log(`posts.json  ${postId}.firstCommentPostedAt = ${when}`);
  } else {
    console.log(`posts.json  no local entry for ${postId} - Firestore updated only`);
  }
} catch (err) {
  console.log(`posts.json  not updated (${err.message}) - Firestore is the one that matters`);
}
