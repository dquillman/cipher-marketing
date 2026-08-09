#!/usr/bin/env node
// Which posted posts are old enough to grade and still ungraded?
//
//   node scripts/list-ungraded-posts.mjs           # human-readable
//   node scripts/list-ungraded-posts.mjs --json    # for the auto-grade routine
//   node scripts/list-ungraded-posts.mjs --min-age-hours 24
//
// Reads Firestore (campaign/posts), never the local posts.json — the remote
// doc is authoritative for posted state. Writes nothing.
//
// The 48-hour default is not arbitrary: LinkedIn keeps serving a post for
// roughly two days, so grading at 12h measures the algorithm's warm-up rather
// than the post. Every early grade would read as a false D.

import { getDb, credentialHelp } from './lib/firestore-access.mjs';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const minAgeHours = Number(
  args[args.indexOf('--min-age-hours') + 1] ?? (args.includes('--min-age-hours') ? NaN : 48),
);
if (!Number.isFinite(minAgeHours) || minAgeHours < 0) {
  console.error('--min-age-hours needs a non-negative number');
  process.exit(2);
}

let db;
try {
  db = await getDb();
} catch (err) {
  console.error(`FAIL — could not authenticate: ${err.message}`);
  console.error(credentialHelp());
  process.exit(1);
}

const snap = await db.collection('campaign').doc('posts').get();
if (!snap.exists) {
  console.error('campaign/posts does not exist');
  process.exit(1);
}
const posts = snap.data()?.posts ?? [];

const now = Date.now();
const cutoffMs = minAgeHours * 60 * 60 * 1000;

const skipped = [];
const ready = [];

for (const p of posts) {
  if (p.status !== 'posted') continue;
  if (p.metrics) continue; // already graded

  if (!p.postedAt) {
    skipped.push({ id: p.id, reason: 'no postedAt timestamp — cannot tell if it is old enough' });
    continue;
  }
  const ageHours = (now - Date.parse(p.postedAt)) / 3_600_000;
  if (!Number.isFinite(ageHours)) {
    skipped.push({ id: p.id, reason: `unparseable postedAt "${p.postedAt}"` });
    continue;
  }
  if (ageHours < minAgeHours) {
    skipped.push({ id: p.id, reason: `only ${ageHours.toFixed(1)}h old (needs ${minAgeHours}h)` });
    continue;
  }
  if (!p.postUrl) {
    // The routine navigates to postUrl to read analytics. Without it there is
    // nothing to open, and guessing a URL would grade the wrong post.
    skipped.push({ id: p.id, reason: 'no postUrl — nothing for the scraper to open' });
    continue;
  }

  ready.push({
    id: p.id,
    channel: p.channel,
    postUrl: p.postUrl,
    postedAt: p.postedAt,
    ageHours: Number(ageHours.toFixed(1)),
    hasVideo: !!p.video,
    examFocus: p.examFocus ?? null,
  });
}

ready.sort((a, b) => b.ageHours - a.ageHours);

if (asJson) {
  // Skipped posts ride along deliberately: a routine that prints only "0 ready"
  // looks identical whether everything is graded or everything is malformed.
  console.log(JSON.stringify({ ready, skipped, minAgeHours }, null, 2));
  process.exit(0);
}

console.log(`ungraded posts at least ${minAgeHours}h old: ${ready.length}\n`);
for (const p of ready) {
  console.log(`  ${p.id}`);
  console.log(`      ${p.channel}${p.hasVideo ? ' (video)' : ''} · ${p.ageHours}h old`);
  console.log(`      ${p.postUrl}`);
}
if (skipped.length) {
  console.log(`\nnot ready (${skipped.length}):`);
  for (const s of skipped) console.log(`  ${s.id} — ${s.reason}`);
}
