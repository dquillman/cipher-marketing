#!/usr/bin/env node
// One-time data fix (2026-08-17): mark the hand-maintained activation-sprint
// tracker as superseded by the measured funnel.
//
// The sprint totals (signedUp 0 / activated 0) sat below the GA4 funnel
// (2 signups / 1 activated) because nobody hand-edits candidates[] — the same
// stale-manual-counter failure as metrics.perCluster. The totals get ONE final
// sync from metrics.funnel.aggregate; after this, the funnel is the source of
// truth and sprint.html renders it directly.
//
// Definitions are kept, not superseded: activated = signup + exam picked +
// >10 questions; day2Return = came back next day — GA4 does not track
// day2Return yet, so that column stays manual until instrumented.
//
// Usage: node scripts/supersede-activation-sprint.mjs [--apply]

import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

const apply = process.argv.includes("--apply");

let db;
try {
  db = await getDb();
} catch (err) {
  console.error("Firestore connection failed:", err.message);
  console.error(credentialHelp());
  process.exit(1);
}
console.log(`connected via ${db.__via}`);

const ref = db.collection("campaign").doc("state");
const snap = await ref.get();
if (!snap.exists) {
  console.error("campaign/state does not exist");
  process.exit(1);
}
const state = snap.data();
const sprint = state.activationSprint;
const agg = state.metrics && state.metrics.funnel && state.metrics.funnel.aggregate;

if (!sprint) {
  console.error("activationSprint block is missing — nothing to supersede");
  process.exit(1);
}
if (!agg || !Number.isFinite(Number(agg.signups)) || !Number.isFinite(Number(agg.activated))) {
  console.error("metrics.funnel.aggregate is missing or malformed — refusing to sync from it");
  process.exit(1);
}

const signedUp = Number(agg.signups);
const activated = Number(agg.activated);
console.log(`current sprint totals: signedUp=${sprint.totals?.signedUp} activated=${sprint.totals?.activated}`);
console.log(`funnel aggregate:      signups=${signedUp} activated=${activated} (asOf ${state.metrics.funnel.asOf})`);
if (sprint.status === "superseded") {
  console.log("activationSprint.status is already 'superseded' — this fix has run before.");
  process.exit(0);
}

const INSTRUCTIONS =
  "SUPERSEDED: do not hand-edit totals. Source of truth is metrics.funnel.aggregate. " +
  "Definitions kept: activated = signup + exam picked + >10 questions; " +
  "day2Return = came back next day (the real proof) — not yet tracked by GA4, instrument before trusting. " +
  "Playbook ref: 15-activation-sprint.md.";

const update = {
  "activationSprint.status": "superseded",
  "activationSprint.supersededBy": "metrics.funnel.aggregate (GA4, scripts/pull-funnel.mjs)",
  "activationSprint.totals.signedUp": signedUp,
  "activationSprint.totals.activated": activated,
  "activationSprint.instructions": INSTRUCTIONS,
  "_meta.lastUpdatedAt": new Date().toISOString(),
  "_meta.lastUpdatedBy": "supersede-activation-sprint",
};

console.log("\nupdate:\n" + JSON.stringify(update, null, 2));
if (!apply) {
  console.log("\ndry run — re-run with --apply to write.");
  process.exit(0);
}

await ref.update(update);
const after = (await ref.get()).data().activationSprint;
console.log("\nwritten. verified readback:");
console.log(`  status=${after.status}`);
console.log(`  supersededBy=${after.supersededBy}`);
console.log(`  totals.signedUp=${after.totals.signedUp} totals.activated=${after.totals.activated}`);
process.exit(0);
