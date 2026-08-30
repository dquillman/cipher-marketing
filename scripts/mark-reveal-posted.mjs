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
// This field stores an INSTANT, not a day. It used to hold a Central Time
// `YYYY-MM-DD`, which cannot be compared against `postedAt` (UTC): Dave's
// 19:20 CT slot is past midnight UTC, so a correctly stamped same-evening
// reveal read as EARLIER than its own post and the reveal-due check called it
// still owed. A day is also too coarse to see a reveal that went up hours
// late, which is the miss the whole check exists to catch. See
// scripts/check-reveal-due.mjs, which owns the reading side.
//
// Usage:
//   node scripts/mark-reveal-posted.mjs <post-id>                    now
//   node scripts/mark-reveal-posted.mjs <post-id> 2026-08-28         noon CT that day
//   node scripts/mark-reveal-posted.mjs <post-id> 2026-08-29T00:31:00.000Z
//   node scripts/mark-reveal-posted.mjs <post-id> --dry
//
// Defaults to the current instant. A bare YYYY-MM-DD is a backfill convenience
// and resolves to 12:00 Central on that day - deliberately mid-day so it can
// never sit on either side of a UTC boundary by accident. When the real minute
// is known, pass the full ISO instant instead.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = join(HERE, "../site/data/posts.json");
const CAMPAIGN_TZ = "America/Chicago";

// Offset (ms) between the wall clock in `tz` and UTC at instant `ts`.
function tzOffsetMs(ts, tz) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(ts));
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  const hour = p.hour === "24" ? "00" : p.hour;
  return Date.UTC(+p.year, +p.month - 1, +p.day, +hour, +p.minute, +p.second) - ts;
}

// Noon in `tz` on a YYYY-MM-DD -> the UTC instant it names.
function noonInZone(day, tz) {
  const [y, mo, d] = day.split("-").map(Number);
  const base = Date.UTC(y, mo - 1, d, 12, 0, 0, 0);
  let ts = base - tzOffsetMs(base, tz);
  ts = base - tzOffsetMs(ts, tz);
  return new Date(ts).toISOString();
}

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const [postId, maybeWhen] = args.filter((a) => a !== "--dry");

if (!postId) {
  console.error("Usage: node scripts/mark-reveal-posted.mjs <post-id> [YYYY-MM-DD | ISO instant] [--dry]");
  process.exit(1);
}

let stamp;
if (!maybeWhen) {
  stamp = new Date().toISOString();
} else if (/^\d{4}-\d{2}-\d{2}$/.test(maybeWhen)) {
  stamp = noonInZone(maybeWhen, CAMPAIGN_TZ);
  console.log(`note  ${maybeWhen} has no time - recording 12:00 ${CAMPAIGN_TZ} (${stamp})`);
} else {
  const parsed = new Date(maybeWhen);
  if (Number.isNaN(parsed.getTime())) {
    console.error(`x  cannot read "${maybeWhen}" as a time - expected YYYY-MM-DD or an ISO instant`);
    process.exit(1);
  }
  stamp = parsed.toISOString();
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
// A reveal can never predate its own post, so refuse rather than repair. An
// earlier version of this script silently CLAMPED the stamp forward to
// postedAt, which made a wrong value look right and left no trace that a wrong
// value had ever been supplied. A guard that aborts beats a value written
// once: if this fires, the caller's idea of when the reveal went up is wrong
// and a human needs to look, not a script needs to guess.
const postedAtDate = target.postedAt ? new Date(target.postedAt) : null;
const postedAtIso =
  postedAtDate && !Number.isNaN(postedAtDate.getTime()) ? postedAtDate.toISOString() : null;
if (postedAtIso && stamp < postedAtIso) {
  console.error(`x  reveal ${stamp} precedes postedAt ${postedAtIso} - refusing to write`);
  process.exit(1);
}

if (target.firstCommentPostedAt) {
  console.log(`already marked: ${postId} firstCommentPostedAt = ${target.firstCommentPostedAt}`);
  if (target.firstCommentPostedAt === stamp) process.exit(0);
  console.log(`overwriting with ${stamp}`);
}

if (dry) {
  console.log(`[dry] would set firstCommentPostedAt = ${stamp} on ${postId}`);
  console.log(`[dry] reveal text starts: ${String(target.firstComment).slice(0, 80)}...`);
  process.exit(0);
}

target.firstCommentPostedAt = stamp;
await ref.set({ ...remote, posts }, { merge: true });
console.log(`firestore  ${postId}.firstCommentPostedAt = ${stamp}`);

// Mirror into the local file so the repo and Firestore agree.
try {
  const local = JSON.parse(readFileSync(POSTS_FILE, "utf8"));
  const lp = (local.posts || []).find((p) => p.id === postId);
  if (lp) {
    lp.firstCommentPostedAt = stamp;
    delete lp.revealPostedAt; // the dead field name
    writeFileSync(POSTS_FILE, JSON.stringify(local, null, 2) + "\n");
    console.log(`posts.json  ${postId}.firstCommentPostedAt = ${stamp}`);
  } else {
    console.log(`posts.json  no local entry for ${postId} - Firestore updated only`);
  }
} catch (err) {
  console.log(`posts.json  not updated (${err.message}) - Firestore is the one that matters`);
}
