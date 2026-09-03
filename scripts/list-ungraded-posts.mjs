#!/usr/bin/env node
// Which posted posts are old enough to grade and still ungraded?
//
//   node scripts/list-ungraded-posts.mjs           # human-readable
//   node scripts/list-ungraded-posts.mjs --json    # for the auto-grade routine
//   node scripts/list-ungraded-posts.mjs --min-age-hours 24
//   node scripts/list-ungraded-posts.mjs --regrade # posts due for RE-measurement
//
// Reads Firestore (campaign/posts), never the local posts.json — the remote
// doc is authoritative for posted state. Writes nothing.
//
// The 48-hour default is not arbitrary: LinkedIn keeps serving a post for
// roughly two days, so grading at 12h measures the algorithm's warm-up rather
// than the post. Every early grade would read as a false D.
//
// The routing rule itself — including why "has metrics" is NOT the same as
// "graded" — lives in scripts/lib/grading-queue.mjs, next to the test that
// holds it in place. This file only fetches and prints.

import { getDb, credentialHelp } from './lib/firestore-access.mjs';
import { classifyPosts, DEFAULT_MIN_AGE_HOURS } from './lib/grading-queue.mjs';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const regradeMode = args.includes('--regrade');
// indexOf returns -1 when the flag is absent, and args[-1 + 1] is args[0] — so
// reading the value before checking for the flag made `--json` alone parse as
// the min-age value and fail. Check for the flag first.
const ageFlagIdx = args.indexOf('--min-age-hours');
const minAgeHours = ageFlagIdx === -1 ? DEFAULT_MIN_AGE_HOURS : Number(args[ageFlagIdx + 1]);
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

const { ready, skipped } = classifyPosts(posts, { minAgeHours, regradeMode });

if (asJson) {
  // Skipped posts ride along deliberately: a routine that prints only "0 ready"
  // looks identical whether everything is graded or everything is malformed.
  console.log(JSON.stringify({ mode: regradeMode ? 'regrade' : 'grade', ready, skipped, minAgeHours }, null, 2));
  process.exit(0);
}

if (regradeMode) {
  console.log(`graded posts due for RE-measurement: ${ready.length}\n`);
  for (const p of ready) {
    console.log(`  ${p.id}   [${p.milestone} milestone]`);
    console.log(`      ${p.channel} · last read at ${p.lastGradedAtDays}d = ${p.lastImpressions} impressions`);
    console.log(`      ${p.postUrl}`);
  }
} else {
  console.log(`ungraded posts at least ${minAgeHours}h old: ${ready.length}\n`);
  for (const p of ready) {
    console.log(`  ${p.id}`);
    console.log(`      ${p.channel}${p.hasVideo ? ' (video)' : ''} · ${p.ageHours}h old`);
    if (p.partialMetrics) {
      console.log(`      partial metrics present (${p.partialMetrics.join(', ')}) — a full read replaces them`);
    }
    console.log(`      ${p.postUrl}`);
  }
}
if (skipped.length) {
  console.log(`\nnot ready (${skipped.length}):`);
  for (const s of skipped) console.log(`  ${s.id} — ${s.reason}`);
}
