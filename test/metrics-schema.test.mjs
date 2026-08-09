import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// Guards the canonical metrics schema documented in site/data/metrics-schema.md.
//
// Before 2026-08-06 there was no schema: eight graded posts carried seven
// different key sets, X and LinkedIn used different names for the same
// concepts, the grader's engagement formula read a `likes` field LinkedIn
// never reports, and `linkClicks` — absent from LinkedIn's export — was a
// hard requirement for an A or B, capping every LinkedIn post at C.
//
// These tests exist so that drift is a failing build rather than a discovery
// three months later.

const posts = JSON.parse(
  fs.readFileSync(new URL('../site/data/posts.json', import.meta.url), 'utf8'),
).posts;

const CORE_KEYS = [
  'impressions', 'membersReached', 'impressionsToReachPct',
  'inNetworkPct', 'outOfNetworkPct',
  'reactions', 'comments', 'reposts', 'saves', 'sends',
  'socialEngagements', 'engagementRatePct',
  'videoViews', 'videoViewRatePct', 'watchTimeSeconds', 'avgWatchTimeSeconds',
  'profileViewers', 'followersGained',
  'linkClicks', 'linkClickRatePct', 'trialSignupsAttributed',
  'gradedAt', 'notes', 'channelExtras',
].sort();

// Renamed away on 2026-08-06. Any reappearance means someone graded against
// the old shape.
const RETIRED_KEYS = [
  'likes', 'engagementActions', 'replies', 'bookmarks',
  'profileVisits', 'followsGained', 'utmAttributionNote',
  'detailExpands', 'audienceRetentionPct', 'videoUniqueViews',
];

const graded = posts.filter((p) => p.metrics);

test('every graded post uses the identical canonical metrics schema', () => {
  assert.ok(graded.length > 0, 'no graded posts found');
  for (const p of graded) {
    assert.deepEqual(
      Object.keys(p.metrics).sort(),
      CORE_KEYS,
      `${p.id} deviates from the canonical schema in metrics-schema.md`,
    );
  }
});

test('retired metric names never reappear at the top level', () => {
  for (const p of graded) {
    for (const k of RETIRED_KEYS) {
      assert.ok(
        !(k in p.metrics),
        `${p.id} uses retired key "${k}" — see site/data/metrics-schema.md for the replacement`,
      );
    }
  }
});

test('derived rates agree with their source numbers', () => {
  const near = (a, b) => Math.abs(a - b) < 0.02;
  for (const p of graded) {
    const m = p.metrics;
    if (!m.impressions) continue;
    for (const [rate, num] of [
      ['impressionsToReachPct', 'membersReached'],
      ['engagementRatePct', 'socialEngagements'],
      ['videoViewRatePct', 'videoViews'],
      ['linkClickRatePct', 'linkClicks'],
    ]) {
      if (m[num] === null) {
        assert.equal(m[rate], null, `${p.id}: ${num} is null so ${rate} must be null, not ${m[rate]}`);
        continue;
      }
      assert.ok(
        near(m[rate], (m[num] / m.impressions) * 100),
        `${p.id}: ${rate}=${m[rate]} disagrees with ${num}/${m.impressions}`,
      );
    }
  }
});

test('null means not-measured and is never silently turned into zero', () => {
  // X does not report these at all; recording 0 would claim we measured them.
  for (const p of graded.filter((x) => x.channel === 'x')) {
    for (const k of ['membersReached', 'inNetworkPct', 'outOfNetworkPct', 'sends']) {
      assert.equal(p.metrics[k], null, `${p.id}: X does not report ${k}; it must be null, not ${p.metrics[k]}`);
    }
  }
});

test('the grading endpoint writes the same core keys hand-grading does', () => {
  // The tests above only ever see posts.json. Grades submitted through
  // /api/grade land in Firestore, so when that endpoint wrote a narrower key
  // set than hand-grading did — 20 keys against 24, missing channelExtras,
  // impressionsToReachPct, notes and trialSignupsAttributed — nothing caught
  // it (found 2026-08-08, while wiring up unattended grading). Assert the
  // endpoint's own list instead of waiting for a divergent post to be synced.
  const fn = fs.readFileSync(new URL('../functions/index.js', import.meta.url), 'utf8');
  const block = fn.match(/const CORE_METRIC_KEYS = \[([\s\S]*?)\];/);
  assert.ok(block, 'functions/index.js no longer defines CORE_METRIC_KEYS');

  const endpointKeys = [...block[1].matchAll(/"([a-zA-Z]+)"/g)].map((m) => m[1]).sort();
  assert.deepEqual(
    endpointKeys,
    CORE_KEYS,
    'the /api/grade key set has drifted from the canonical schema in metrics-schema.md',
  );

  // Null in, null out. A rate computed from a numerator that was never
  // measured would read as a real 0% and contradict the derived-rate test.
  assert.match(fn, /if \(raw\[numerator\] == null\) out\[rate\] = null;/);
});

test('the metrics schema doc exists and covers every core key', () => {
  const doc = fs.readFileSync(new URL('../site/data/metrics-schema.md', import.meta.url), 'utf8');
  for (const k of CORE_KEYS) {
    assert.ok(doc.includes(`\`${k}\``), `metrics-schema.md does not document \`${k}\``);
  }
});
