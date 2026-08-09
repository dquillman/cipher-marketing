#!/usr/bin/env node
// Submit metrics for one post to /api/grade, unattended.
//
//   node scripts/submit-grade.mjs --post li-thu-2026-08-07-sponsor-scenario \
//        --metrics '{"impressions":310,"membersReached":200,"inNetworkPct":13}'
//
//   node scripts/submit-grade.mjs --post <id> --metrics-file metrics.json
//   node scripts/submit-grade.mjs --post <id> --metrics '{...}' --dry
//
// This is the modal's job without the modal: same endpoint, same rubric, same
// AI notes, same Firestore write. The dashboard's onSnapshot picks the grade up
// live.
//
// Metric names must match the canonical schema in site/data/metrics-schema.md.
// A metric the platform does not report is `null`, never 0 and never omitted —
// 0 claims a measurement that was never taken.

import { readFileSync } from 'node:fs';
import { API_BASE, authHeaders } from './lib/api-auth.mjs';

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : null;
}

const postId = arg('post');
const metricsRaw = arg('metrics');
const metricsFile = arg('metrics-file');
const dry = process.argv.includes('--dry');

if (!postId || (!metricsRaw && !metricsFile)) {
  console.error('Usage: node scripts/submit-grade.mjs --post <postId> --metrics \'{"impressions":310}\'');
  console.error('   or: node scripts/submit-grade.mjs --post <postId> --metrics-file <path.json>');
  process.exit(2);
}

let metrics;
try {
  metrics = JSON.parse(metricsFile ? readFileSync(metricsFile, 'utf8') : metricsRaw);
} catch (err) {
  console.error(`metrics is not valid JSON: ${err.message}`);
  process.exit(2);
}
if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) {
  console.error('metrics must be a JSON object');
  process.exit(2);
}

// LinkedIn has no link-click export; that number only exists in GA4 by UTM.
// A scraper reading the analytics page can only ever be guessing at it, and a
// guessed click count inflates linkClickRatePct straight into an A.
if (metrics.linkClicks != null && String(arg('link-clicks-source') || '') !== 'ga4') {
  console.error('refusing: linkClicks was supplied without --link-clicks-source ga4.');
  console.error('LinkedIn does not report clicks (site/data/metrics-schema.md); leave it null');
  console.error('unless the number genuinely came from GA4.');
  process.exit(2);
}

console.log(`post:    ${postId}`);
console.log(`metrics: ${JSON.stringify(metrics)}`);

if (dry) {
  console.log('\n--dry: nothing submitted.');
  process.exit(0);
}

let headers;
try {
  headers = await authHeaders();
} catch (err) {
  console.error(`\nFAIL — ${err.message}`);
  console.error('The routine needs FIREBASE_SERVICE_ACCOUNT pointing at a service-account key.');
  process.exit(1);
}

const res = await fetch(`${API_BASE}/api/grade`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify({ postId, metrics }),
});

const json = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error(`\nFAIL — HTTP ${res.status}: ${json.error || 'unknown error'}`);
  process.exit(1);
}

console.log(`\ngraded ${json.grade}${json.notesUnavailable ? '  (notes unavailable)' : ''}`);
if (json.engagementRatePct != null) console.log(`  engagement rate  ${json.engagementRatePct}%`);
if (json.linkClickRatePct != null) console.log(`  link-click rate  ${json.linkClickRatePct}%`);
if (json.gradeNotes) console.log(`\n${json.gradeNotes}`);
if (json.recommendation) console.log(`\nnext: ${json.recommendation}`);
