#!/usr/bin/env node
// Reverts a post from "posted" back to "scheduled", or corrects the recorded
// postUrl without unposting. The inverse of mark-published.mjs.
//
// WHY THIS WRITES BOTH SIDES: seed-firestore.mjs deliberately treats a Firestore
// "posted" status and a non-empty postedAt/postUrl as authoritative — it merges
// them back over the local file so a re-seed can never demote a post you already
// published. That means editing posts.json alone does NOT unpost anything; the
// next seed silently restores it. So this script clears the fields in Firestore
// and in site/data/posts.json together.
//
// Usage:
//   node scripts/unpost.mjs <post-id|li|x>                  # dry run
//   node scripts/unpost.mjs <post-id|li|x> --apply          # revert to scheduled
//   node scripts/unpost.mjs <post-id> --url <new-url> --apply   # just fix the URL
//   node scripts/unpost.mjs <post-id> --apply --local-only  # skip Firestore
//
// Examples:
//   node scripts/unpost.mjs x-2026-08-03-the-exam-changed --apply
//   node scripts/unpost.mjs x --url https://x.com/QuillmanDavid/status/123 --apply

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = join(HERE, "../site/data/posts.json");

// ---- Parse args ----
const argv = process.argv.slice(2);
const APPLY = argv.includes("--apply");
const LOCAL_ONLY = argv.includes("--local-only");

const urlIdx = argv.indexOf("--url");
const newUrl = urlIdx !== -1 ? argv[urlIdx + 1] : null;
const idOrAlias = argv.find((a) => !a.startsWith("--") && a !== newUrl);

if (!idOrAlias) {
  console.error("Usage: node scripts/unpost.mjs <post-id|li|x> [--url <new-url>] [--apply]");
  console.error("  (no --apply = dry run)");
  process.exit(1);
}

if (urlIdx !== -1 && (!newUrl || !newUrl.startsWith("http"))) {
  console.error(`✗  --url needs an https:// value, got: ${newUrl ?? "(nothing)"}`);
  process.exit(1);
}

const MODE = newUrl ? "retarget" : "unpost";

// ---- Locate the post in the local file ----
const data = JSON.parse(readFileSync(POSTS_FILE, "utf8"));

function findPost(alias) {
  const exact = data.posts.find((p) => p.id === alias);
  if (exact) return exact;

  const CHANNEL_MAP = { li: "linkedin", x: "x" };
  const channel = CHANNEL_MAP[alias.toLowerCase()];
  if (!channel) return null;

  // Most recently posted entry on that channel — that's the one you'd want back.
  const posted = data.posts
    .filter((p) => p.channel === channel && p.status === "posted")
    .sort((a, b) => String(b.postedAt || "").localeCompare(String(a.postedAt || "")));

  if (posted.length > 1) {
    console.warn(`⚠  ${posted.length} posted ${channel} posts — using most recent: ${posted[0].id}`);
  }
  return posted[0] || null;
}

const post = findPost(idOrAlias);

if (!post) {
  console.error(`✗  No post found matching "${idOrAlias}".`);
  console.error("   Posted entries:");
  const posted = data.posts.filter((p) => p.status === "posted");
  if (posted.length === 0) console.error("     (none)");
  posted.forEach((p) => console.error(`     ${p.id}  ${p.postUrl || "(no url)"}`));
  process.exit(1);
}

if (post.status !== "posted" && MODE === "unpost") {
  console.warn(`⚠  "${post.id}" is not marked posted (status: ${post.status}) — nothing to revert.`);
  process.exit(0);
}

// ---- Report what will change ----
console.log(`\n${MODE === "unpost" ? "Unposting" : "Retargeting"}: ${post.id}`);
console.log(`  channel:  ${post.channel}`);
console.log(`  status:   ${post.status}${MODE === "unpost" ? " → scheduled" : " (unchanged)"}`);
console.log(`  postedAt: ${post.postedAt || "(none)"}${MODE === "unpost" ? " → null" : " (unchanged)"}`);
console.log(`  postUrl:  ${post.postUrl || "(none)"} → ${MODE === "unpost" ? "null" : newUrl}`);

const hasGrade = post.grade || (post.metrics && Object.keys(post.metrics).length > 0);
if (hasGrade && MODE === "unpost") {
  console.log(
    `\n⚠  This post has a grade (${post.grade || "—"}) and/or metrics attached.\n` +
      `   They are being LEFT IN PLACE — they describe the version that was live.\n` +
      `   Clear them by hand if you are re-posting different content.`
  );
}

function applyTo(p) {
  if (MODE === "unpost") {
    p.status = "scheduled";
    p.postedAt = null;
    p.postUrl = null;
  } else {
    p.postUrl = newUrl;
  }
  return p;
}

if (!APPLY) {
  console.log(`\nDry run — nothing written. Re-run with --apply.`);
  process.exit(0);
}

// ---- Write local posts.json ----
applyTo(post);
data._meta.lastUpdatedAt = new Date().toISOString();
data._meta.lastUpdatedBy = MODE === "unpost" ? "unpost" : "unpost --url";
writeFileSync(POSTS_FILE, JSON.stringify(data, null, 2) + "\n");
console.log(`\n✓  Updated local site/data/posts.json`);

// ---- Write Firestore (required, or the next seed undoes this) ----
if (LOCAL_ONLY) {
  console.log(
    `\n⚠  --local-only: Firestore still says posted. The deployed dashboard is\n` +
      `   unchanged, and the next seed-firestore run will restore the posted state.`
  );
  process.exit(0);
}

const { getDb, credentialHelp } = await import("./lib/firestore-access.mjs");

let db;
try {
  db = await getDb();
} catch (err) {
  console.error(`\n❌ Firestore connection failed: ${err.message}`);
  console.error(credentialHelp());
  console.error(
    `\n⚠  The local file was updated but Firestore was NOT. Until you re-run this\n` +
      `   with a working credential, the dashboard still shows the post as posted.`
  );
  process.exit(1);
}

console.log(`🔗 Connected to Firestore via ${db.__via}`);

const postsRef = db.collection("campaign").doc("posts");
const doc = await postsRef.get();
if (!doc.exists) {
  console.error("❌ campaign/posts does not exist in Firestore");
  process.exit(1);
}

const remote = doc.data();
const posts = remote.posts || [];
const target = posts.find((p) => p.id === post.id);

if (!target) {
  console.error(`❌ ${post.id} not found in Firestore — local file updated, Firestore untouched.`);
  process.exit(1);
}

applyTo(target);

try {
  await postsRef.update({ posts });
  console.log(`✓  Updated Firestore campaign/posts`);
  console.log(
    MODE === "unpost"
      ? `\n✅ ${post.id} is back to "scheduled". Refresh the dashboard — it reappears in the schedule feed.`
      : `\n✅ ${post.id} postUrl is now ${newUrl}. Refresh the dashboard.`
  );
} catch (err) {
  console.error("\n❌ Firestore update failed:", err.message);
  if (err.code === 7) {
    console.error("\n🔒 Permission denied — the service account needs marketingAdmin write access.");
    console.error(credentialHelp());
  }
  process.exit(1);
}
