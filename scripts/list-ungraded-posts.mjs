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
// --regrade exists because 48h turned out to be far too short on this account,
// and nothing ever re-read a post once it had metrics. Measured 2026-08-12:
// li-thu-2026-08-07-sponsor-scenario was graded at 732 impressions, was 1,220 a
// day later, and 2,134 two days after that — 2.9x growth AFTER its grade was
// assigned. Because grades feed grading-lessons.md and that file constrains
// draft-week-posts, an understated grade propagates into drafting rules. The
// first read stays at 48h so there is a fast signal; --regrade re-reads at the
// milestones below so the number that ends up in a lesson is the real one.
const REGRADE_MILESTONE_DAYS = [7, 30];

import { getDb, credentialHelp } from './lib/firestore-access.mjs';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const regradeMode = args.includes('--regrade');
// indexOf returns -1 when the flag is absent, and args[-1 + 1] is args[0] — so
// reading the value before checking for the flag made `--json` alone parse as
// the min-age value and fail. Check for the flag first.
const ageFlagIdx = args.indexOf('--min-age-hours');
const minAgeHours = ageFlagIdx === -1 ? 48 : Number(args[ageFlagIdx + 1]);
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

  if (regradeMode) {
    // Inverse of the normal pass: we want posts that HAVE metrics but whose
    // numbers were read before a milestone the post has since crossed.
    if (!p.metrics) continue; // never graded — the default pass owns these
    if (!p.postedAt) continue; // no timestamp, no milestone to be due for
    if (!p.postUrl) {
      // Must be reported, never silently dropped: a graded post with no URL can
      // never be re-read, and a bare "0 due" would look like everything is fine.
      skipped.push({ id: p.id, reason: 'graded but has no postUrl — can never be re-measured; backfill the URL' });
      continue;
    }
    const gradedAt = Date.parse(p.metrics.gradedAt ?? '');
    if (!Number.isFinite(gradedAt)) {
      skipped.push({ id: p.id, reason: 'metrics present but no parseable gradedAt' });
      continue;
    }
    const ageDays = (now - Date.parse(p.postedAt)) / 86_400_000;
    const gradeAgeDays = (gradedAt - Date.parse(p.postedAt)) / 86_400_000;
    // Due when the post has passed a milestone that its last reading predates.
    const due = REGRADE_MILESTONE_DAYS.filter((m) => ageDays >= m && gradeAgeDays < m);
    if (!due.length) continue;
    ready.push({
      id: p.id,
      channel: p.channel,
      postUrl: p.postUrl,
      postedAt: p.postedAt,
      ageHours: Number((ageDays * 24).toFixed(1)),
      milestone: `${Math.max(...due)}d`,
      lastImpressions: p.metrics.impressions ?? null,
      lastGradedAtDays: Number(gradeAgeDays.toFixed(1)),
      hasVideo: !!p.video,
      examFocus: p.examFocus ?? null,
    });
    continue;
  }

  if (p.metrics) continue; // already graded — see --regrade

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
    console.log(`      ${p.postUrl}`);
  }
}
if (skipped.length) {
  console.log(`\nnot ready (${skipped.length}):`);
  for (const s of skipped) console.log(`  ${s.id} — ${s.reason}`);
}
