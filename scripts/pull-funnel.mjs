#!/usr/bin/env node
// Fill the dashboard funnel from GA4 instead of by hand.
//
//   node scripts/pull-funnel.mjs            # 7-day window, writes JSON + Firestore
//   node scripts/pull-funnel.mjs --days 30
//   node scripts/pull-funnel.mjs --dry
//
// The funnel block in campaign-state.json carried the instruction "Hand-entered
// daily". Nobody entered it: every figure sat at zero, stamped 2026-05-28, for
// 74 days. A number that has to be typed in every morning is a number that
// stops being true on day two.
//
// Five arrows: impressions -> lpVisits -> signups -> examPicked -> activated.
// Only the first comes from the social platforms (GA4 cannot see a LinkedIn
// impression); the rest come from GA4.

import { readFileSync, writeFileSync } from 'node:fs';
import { getDb, credentialHelp } from './lib/firestore-access.mjs';
import { runReport } from './lib/ga4.mjs';

const STATE_PATH = new URL('../site/data/campaign-state.json', import.meta.url);

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const daysIdx = args.indexOf('--days');
const windowDays = daysIdx === -1 ? 7 : Number(args[daysIdx + 1]);
if (!Number.isFinite(windowDays) || windowDays < 1) {
  console.error('--days needs a positive number');
  process.exit(2);
}

// Every query is scoped to the production hostnames. Without this the numbers
// are ~12x too high: 930 of 1084 sessions in the last 90-day window were
// Playwright e2e runs against localhost with the production tag firing. That
// was fixed at the tag on 2026-08-10, but historical rows cannot be cleaned —
// only filtered — so this stays regardless.
const PROD_HOSTS = {
  orGroup: {
    expressions: [
      { filter: { fieldName: 'hostName', stringFilter: { value: 'cipherexam.com' } } },
      { filter: { fieldName: 'hostName', stringFilter: { value: 'www.cipherexam.com' } } },
    ],
  },
};

// Dashboard cluster name -> landing page prefix.
const CLUSTERS = {
  PMP: '/lp/pmp',
  'Security+': '/lp/security-plus',
  'SHRM-CP': '/lp/shrm-cp',
};

const dateRanges = [{ startDate: `${windowDays}daysAgo`, endDate: 'today' }];
const and = (...expressions) => ({ andGroup: { expressions } });
const first = (json) => Number(json.rows?.[0]?.metricValues?.[0]?.value ?? 0);

async function users(extra) {
  return first(await runReport({
    dateRanges,
    metrics: [{ name: 'totalUsers' }],
    dimensionFilter: extra ? and(PROD_HOSTS, extra) : PROD_HOSTS,
  }));
}

async function eventUsers(eventName, extra) {
  const expressions = [PROD_HOSTS, { filter: { fieldName: 'eventName', stringFilter: { value: eventName } } }];
  if (extra) expressions.push(extra);
  return first(await runReport({
    dateRanges,
    metrics: [{ name: 'totalUsers' }],
    dimensionFilter: and(...expressions),
  }));
}

const lpPrefix = (path) => ({
  filter: { fieldName: 'landingPagePlusQueryString', stringFilter: { matchType: 'BEGINS_WITH', value: path } },
});

// ---- social impressions come from the graded posts, not GA4 ---------------
let db;
try {
  db = await getDb();
} catch (err) {
  console.error(`Firestore auth failed: ${err.message}`);
  console.error(credentialHelp());
  process.exit(1);
}

const postsSnap = await db.collection('campaign').doc('posts').get();
const cutoff = Date.now() - windowDays * 86400000;
const inWindow = (postsSnap.data()?.posts ?? []).filter(
  (p) => p.metrics && p.postedAt && Date.parse(p.postedAt) >= cutoff,
);
const impressionsFor = (examFocus) => inWindow
  .filter((p) => !examFocus || p.examFocus === examFocus)
  .reduce((sum, p) => sum + (Number(p.metrics.impressions) || 0), 0);

// Dashboard cluster name -> posts.json examFocus value.
const EXAM_FOCUS = { PMP: 'PMP', 'Security+': 'Security+', 'SHRM-CP': 'SHRM-CP' };

// ---- aggregate ------------------------------------------------------------
const aggregate = {
  impressions: impressionsFor(null),
  lpVisits: await users(lpPrefix('/lp/')),
  signups: await eventUsers('signup_complete'),
  examPicked: await eventUsers('exam_selected'),
  activated: await eventUsers('activated_user'),
};

// ---- per cluster ----------------------------------------------------------
const perCluster = {};
for (const [name, path] of Object.entries(CLUSTERS)) {
  perCluster[name] = {
    impressions: impressionsFor(EXAM_FOCUS[name]),
    lpVisits: await users(lpPrefix(path)),
    // Session-scoped landing page, so these are "signed up in a session that
    // began on this cluster's LP" — not "signed up for this exam".
    signups: await eventUsers('signup_complete', lpPrefix(path)),
    examPicked: await eventUsers('exam_selected', lpPrefix(path)),
    activated: await eventUsers('activated_user', lpPrefix(path)),
  };
}

const now = new Date().toISOString();
const funnel = {
  asOf: now,
  windowDays,
  source: 'GA4 property 528695114 (production hostnames only) + graded post impressions',
  instructions:
    'Filled automatically by scripts/pull-funnel.mjs — do not hand-edit. ' +
    'impressions come from graded posts in campaign/posts (GA4 cannot see a ' +
    'LinkedIn impression); the other four arrows are GA4 unique users, scoped ' +
    'to cipherexam.com/www.cipherexam.com. perCluster is keyed on the session ' +
    'landing page, so it means "began on this LP", not "bought this exam".',
  aggregate,
  perCluster,
};

console.log(`window: last ${windowDays} days   (production hostnames only)\n`);
console.log('  aggregate');
for (const [k, v] of Object.entries(aggregate)) console.log(`      ${k.padEnd(12)} ${v}`);
for (const [name, c] of Object.entries(perCluster)) {
  console.log(`  ${name}`);
  for (const [k, v] of Object.entries(c)) console.log(`      ${k.padEnd(12)} ${v}`);
}

if (dry) {
  console.log('\n--dry: nothing written.');
  process.exit(0);
}

// ---- 1. local file --------------------------------------------------------
const state = JSON.parse(readFileSync(STATE_PATH, 'utf8'));
state.metrics = state.metrics || {};
state.metrics.funnel = funnel;
state.metrics.trialSignupsTotal = aggregate.signups;
state.metrics.activatedUsersTotal = aggregate.activated;
state.metrics.perCluster = state.metrics.perCluster || {};
for (const [name, c] of Object.entries(perCluster)) {
  state.metrics.perCluster[name] = {
    ...(state.metrics.perCluster[name] || {}),
    signups: c.signups,
    activated: c.activated,
  };
}
state._meta = state._meta || {};
state._meta.lastUpdatedAt = now;
state._meta.lastUpdatedBy = 'pull-funnel';
writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
console.log('\ncampaign-state.json: funnel updated.');

// ---- 2. Firestore, which is what the dashboard actually reads -------------
// site/data/** is excluded by firebase.json, so the deployed dashboard never
// sees the local file — it reads campaign/state. Writing only the JSON would
// look like it worked and change nothing on screen.
const docRef = db.collection('campaign').doc('state');
const snap = await docRef.get();
const live = snap.exists ? snap.data() : {};
live.metrics = { ...(live.metrics || {}), ...state.metrics };
live._meta = { ...(live._meta || {}), lastUpdatedAt: now, lastUpdatedBy: 'pull-funnel' };
await docRef.set(live);
console.log('Firestore campaign/state: funnel mirrored.');
