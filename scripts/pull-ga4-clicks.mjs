#!/usr/bin/env node
// Pull the two metrics no social platform can give us, from GA4 by UTM.
//
//   node scripts/pull-ga4-clicks.mjs --post li-thu-2026-08-07-sponsor-scenario
//   node scripts/pull-ga4-clicks.mjs --post <id> --json
//   node scripts/pull-ga4-clicks.mjs --all
//
// linkClicks            LinkedIn never reports it; X counts clicks where GA4
//                       counts arrivals. GA4 is the truer number for both.
// trialSignupsAttributed  The only number that ultimately matters.
//
// Writes nothing. Feed the --json output into scripts/submit-grade.mjs.

import { getDb, credentialHelp } from './lib/firestore-access.mjs';
import { GA4_PROPERTY_ID, eventCountForUtm, resolveUtms, sessionsForUtm } from './lib/ga4.mjs';

const TRIAL_EVENT = 'trial_start';

function isoDayBefore(timestamp) {
  const t = Date.parse(timestamp);
  if (!Number.isFinite(t)) return '90daysAgo';
  return new Date(t - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const all = args.includes('--all');
const postIdx = args.indexOf('--post');
const postId = postIdx === -1 ? null : args[postIdx + 1];

if (!all && !postId) {
  console.error('Usage: node scripts/pull-ga4-clicks.mjs --post <postId> [--json]');
  console.error('   or: node scripts/pull-ga4-clicks.mjs --all');
  process.exit(2);
}

let db;
try {
  db = await getDb();
} catch (err) {
  console.error(`FAIL — could not authenticate to Firestore: ${err.message}`);
  console.error(credentialHelp());
  process.exit(1);
}

const snap = await db.collection('campaign').doc('posts').get();
const posts = snap.data()?.posts ?? [];

const targets = all
  ? posts.filter((p) => p.status === 'posted' && p.cta)
  : posts.filter((p) => p.id === postId);

if (!targets.length) {
  console.error(all ? 'no posted posts with a CTA' : `post "${postId}" not found`);
  process.exit(1);
}

const results = [];

for (const post of targets) {
  const utms = await resolveUtms(post.cta);
  if (!utms) {
    results.push({ id: post.id, error: 'CTA has no utm_campaign/utm_content — cannot attribute' });
    continue;
  }

  // postedAt is UTC; GA4 buckets by the property's local day. A post published
  // in the evening Central time carries the NEXT UTC date, so slicing the
  // timestamp drops that first evening's sessions — it hid 2 of the sponsor
  // post's 5. Back up a day and let the utm_source + utm_content filter do the
  // narrowing.
  const startDate = post.postedAt ? isoDayBefore(post.postedAt) : '90daysAgo';

  try {
    const [linkClicks, trialSignupsAttributed] = await Promise.all([
      sessionsForUtm(utms, startDate),
      eventCountForUtm(utms, TRIAL_EVENT, startDate),
    ]);
    results.push({ id: post.id, channel: post.channel, ...utms, startDate, linkClicks, trialSignupsAttributed });
  } catch (err) {
    results.push({ id: post.id, error: err.message });
  }
}

if (asJson) {
  console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
  process.exit(results.some((r) => r.error) ? 1 : 0);
}

console.log(`GA4 property ${GA4_PROPERTY_ID}\n`);
for (const r of results) {
  if (r.error) {
    console.log(`  ${r.id}\n      ERROR: ${r.error}`);
    continue;
  }
  console.log(`  ${r.id}`);
  console.log(`      utm            ${r.campaign} / ${r.content}`);
  console.log(`      since          ${r.startDate}`);
  console.log(`      linkClicks     ${r.linkClicks}`);
  console.log(`      trialSignups   ${r.trialSignupsAttributed}`);
}
