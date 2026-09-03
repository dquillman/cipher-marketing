#!/usr/bin/env node
// Repairs `postedAt` on already-posted LinkedIn posts by reading the real
// publish instant off each permalink.
//
// Why this exists (2026-09-01): both write paths (scripts/mark-published.mjs
// and the dashboard "Mark Posted" button) used to stamp `new Date()` at the
// moment the post was RECORDED, not published. The consequence was not
// cosmetic: scripts/check-reveal-due.mjs compares the reveal's instant against
// `postedAt`, so an inflated `postedAt` made a reveal that went up 15 minutes
// after publish read as preceding its own post. The reveal-due task reported it
// as still owed, and scripts/mark-reveal-posted.mjs then correctly refused to
// record it. Both guards behaved; the number underneath them was wrong.
//
// Two distinct defects, both repaired from the same source of truth - the
// activity id in the permalink, which carries the post's creation time in its
// top bits (see scripts/lib/linkedin-time.mjs):
//
//   drift        `postedAt` is LATER than the permalink - the recording lag
//                described above, measured from +1.5 min to +32.6 h. Always
//                moves earlier.
//   plan-as-post `postedAt` is an exact copy of `scheduledTime`, i.e. the time
//                the post was PLANNED for was written down as the time it went
//                out. It is the more dangerous of the two, because it can point
//                either way: on li-wed-2026-08-05-experience-trap the planned
//                time is 11.4h EARLIER than the real one, which would make a
//                reveal that went up hours late read as on time - a false
//                negative, the miss sailing through the check rather than a
//                false alarm.
//
// Anything else whose `postedAt` precedes its own permalink is reported and left
// alone: recording a post before LinkedIn published it cannot happen, so that
// would mean something other than these two causes, and a human should look.
//
// Both write paths now derive `postedAt` from the urn, so this is a one-time
// repair of the records written before that. It stays in the repo because it is
// also the check that tells you whether the two paths have drifted again.
//
// Usage:
//   node scripts/backfill-posted-at.mjs            # report only (default)
//   node scripts/backfill-posted-at.mjs --apply    # write Firestore + posts.json

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, credentialHelp } from "./lib/firestore-access.mjs";
import { postedAtFromUrn } from "./lib/linkedin-time.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = join(HERE, "../site/data/posts.json");

const apply = process.argv.includes("--apply");

// Below this the difference is rounding, not the recording lag we are fixing.
const NOISE_MS = 1000;

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

const fixes = [];
const anomalies = [];
let checked = 0;

for (const p of posts) {
  if (p.status !== "posted" || !p.postUrl || !p.postedAt) continue;
  const urnIso = postedAtFromUrn(p.postUrl);
  if (!urnIso) continue;

  const stored = new Date(p.postedAt);
  if (Number.isNaN(stored.getTime())) {
    anomalies.push({ id: p.id, why: `unreadable postedAt "${p.postedAt}"` });
    continue;
  }
  checked++;

  const driftMs = stored.getTime() - new Date(urnIso).getTime();
  if (Math.abs(driftMs) < NOISE_MS) continue;

  // `postedAt` identical to `scheduledTime` is the plan copied into the record,
  // not a clock reading, so its direction carries no information either way.
  const planAsPost = !!p.scheduledTime && p.scheduledTime === p.postedAt;

  if (driftMs < 0 && !planAsPost) {
    anomalies.push({
      id: p.id,
      why: `postedAt ${p.postedAt} PRECEDES the permalink's own ${urnIso} - neither drift nor a copied scheduledTime, left alone`,
    });
    continue;
  }

  fixes.push({
    post: p,
    from: p.postedAt,
    to: urnIso,
    driftMin: driftMs / 60000,
    kind: planAsPost ? "plan-as-post" : "drift",
  });
}

console.log(`checked ${checked} posted LinkedIn post(s) with a decodable permalink`);

for (const a of anomalies) console.log(`  !!  ${a.id.padEnd(36)} ${a.why}`);

if (!fixes.length) {
  console.log("no drift found - postedAt agrees with every permalink");
  process.exit(0);
}

for (const f of fixes) {
  const off =
    f.kind === "plan-as-post"
      ? `scheduledTime copied in, ${f.driftMin < 0 ? "" : "+"}${f.driftMin.toFixed(1)} min off`
      : `was +${f.driftMin.toFixed(1)} min late`;
  console.log(`  ${f.kind.padEnd(12)} ${f.post.id.padEnd(36)} ${f.from} -> ${f.to}  (${off})`);
}

// A reveal recorded against the old postedAt stays valid when postedAt moves
// EARLIER. A plan-as-post fix can move it LATER, which can push a stored reveal
// behind its own post - so name those, because they are the ones that need a
// human to re-check rather than a script to guess.
const withReveal = fixes.filter((f) => f.post.firstCommentPostedAt).length;
if (withReveal) {
  console.log(`\n${withReveal} of these already carry a firstCommentPostedAt.`);
}

// Legacy day-only reveal stamps (a bare YYYY-MM-DD) parse as midnight UTC, so
// they compare as "before" almost any same-day postedAt. That is a formatting
// artefact, not a problem - check-reveal-due.mjs already resolves those to a
// range rather than an instant. Only a full instant landing before the
// corrected postedAt is a real contradiction worth a human's time.
const isDayOnly = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v));
const nowLater = fixes.filter(
  (f) =>
    f.post.firstCommentPostedAt &&
    !isDayOnly(f.post.firstCommentPostedAt) &&
    new Date(f.to) > new Date(f.post.firstCommentPostedAt)
);
if (nowLater.length) {
  console.log(`\n!!  ${nowLater.length} would end up with a reveal recorded BEFORE the corrected postedAt:`);
  for (const f of nowLater) {
    console.log(`      ${f.post.id}  reveal ${f.post.firstCommentPostedAt} < postedAt ${f.to}`);
  }
  console.log("    Re-check those reveals against the live post; do not guess a new stamp.");
}

if (!apply) {
  console.log(`\n[report only] re-run with --apply to write ${fixes.length} correction(s)`);
  process.exit(0);
}

for (const f of fixes) f.post.postedAt = f.to;

await ref.set({ ...remote, posts }, { merge: true });
console.log(`\nfirestore  ${fixes.length} postedAt value(s) corrected`);

try {
  const local = JSON.parse(readFileSync(POSTS_FILE, "utf8"));
  const localPosts = local.posts || [];
  let n = 0;
  for (const f of fixes) {
    const lp = localPosts.find((p) => p.id === f.post.id);
    if (lp) { lp.postedAt = f.to; n++; }
  }
  writeFileSync(POSTS_FILE, JSON.stringify(local, null, 2) + "\n");
  console.log(`posts.json  ${n} postedAt value(s) corrected`);
} catch (err) {
  console.log(`posts.json  not updated (${err.message}) - Firestore is the one that matters`);
}
