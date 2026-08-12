#!/usr/bin/env node
// Read-only health check for the campaign Firestore sync path.
//
//   node scripts/check-firestore-access.mjs
//
// Why this exists: firestore.rules requires a marketingAdmin claim (commit
// e7f3f4b, 2026-07-29), so an unauthenticated script gets 403 on everything.
// When that happens the failure is easy to misread — a script can look like it
// "ran fine" while writing nothing, and a stale doc in the dashboard looks
// identical to a fresh one. Twice now (2026-08-01 competitor intel, 2026-08-07
// stale-post skips) time was lost re-diagnosing this from scratch, once
// concluding a write had failed when it had actually succeeded.
//
// Run this first. It answers, in one shot: which credential am I using, can I
// read, and is the campaign data actually current.
//
// Writes nothing.

import { getDb, credentialHelp, PROJECT_ID } from './lib/firestore-access.mjs';

let db;
try {
  db = await getDb();
} catch (err) {
  console.error(`FAIL — could not authenticate: ${err.message}`);
  console.error(credentialHelp());
  process.exit(1);
}

console.log(`project:    ${PROJECT_ID}`);
console.log(`credential: ${db.__via}`);
console.log('');

let failed = false;

// campaign/posts — the doc the dashboard renders.
try {
  const snap = await db.collection('campaign').doc('posts').get();
  if (!snap.exists) throw new Error('document does not exist');
  const data = snap.data() ?? {};
  const posts = Array.isArray(data.posts) ? data.posts : [];

  const today = new Date().toISOString().slice(0, 10);
  const stale = posts.filter(
    (p) => p.status === 'scheduled' && p.scheduled && p.scheduled < today
  );
  const counts = {};
  for (const p of posts) counts[p.status] = (counts[p.status] ?? 0) + 1;

  console.log(`campaign/posts        ${posts.length} posts  ${JSON.stringify(counts)}`);
  console.log(`  last written by:    ${data._meta?.lastUpdatedBy ?? '(unknown)'}`);
  console.log(`  stale scheduled:    ${stale.length}${stale.length ? '  <-- showing as backlog on the Today tab' : ''}`);
  for (const p of stale) console.log(`      ${p.id} (was due ${p.scheduled})`);
} catch (err) {
  failed = true;
  console.error(`campaign/posts        FAIL — ${err.message}`);
}

// campaign/competitors — qcode's ops console reads this.
try {
  const snap = await db.collection('campaign').doc('competitors').get();
  const data = snap.data() ?? {};
  const n = Array.isArray(data.competitors) ? data.competitors.length : 0;
  console.log(`campaign/competitors  ${n} competitors  (mirrored ${data._meta?.mirroredAt ?? data._meta?.lastUpdatedAt ?? 'unknown'})`);
} catch (err) {
  failed = true;
  console.error(`campaign/competitors  FAIL — ${err.message}`);
}

// competitor_intel/* — the three generated reports.
try {
  const snaps = await db.collection('competitor_intel').get();
  const parts = [];
  snaps.forEach((d) => {
    const len = (d.data()?.content ?? '').length;
    parts.push(`${d.id} ${len}c`);
  });
  console.log(`competitor_intel      ${snaps.size} reports  (${parts.join(', ')})`);
} catch (err) {
  failed = true;
  console.error(`competitor_intel      FAIL — ${err.message}`);
}

console.log('');
console.log(failed ? 'RESULT: DEGRADED — see failures above' : 'RESULT: OK — authenticated, campaign data readable');
process.exit(failed ? 1 : 0);
