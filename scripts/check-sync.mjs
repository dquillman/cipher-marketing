#!/usr/bin/env node
// Reports drift between local site/data/posts.json and live Firestore.
//
// Why this exists: on 2026-07-31 the local file held 4 LinkedIn drafts while
// Firestore held 12. Logic was validated against the local copy, which looked
// authoritative, and produced a confidently wrong answer. Firestore is the
// source of truth for anything the dashboard writes (status, grades, video
// fields); the local file is the source of truth for content that gets seeded.
// Neither is "the" truth, which is exactly why silent drift is dangerous.
//
// Usage:
//   node scripts/check-sync.mjs
//   npm run check:sync
//
// Exit code 1 when drift is found, so it can gate a workflow.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const LOCAL = join(HERE, "../site/data/posts.json");

// Fields the dashboard/Cloud Function own — local is expected to lag on these,
// so they are reported as informational rather than as drift to fix.
const REMOTE_OWNED = new Set([
  "status", "grade", "gradeNotes", "recommendations", "metrics", "postedAt", "postUrl",
  "approvedAt", "videoUrl", "videoStatus", "renderedAt", "videoJobId",
  "videoThemeUsed", "videoChipUsed", "videoAspect", "videoTemplateVersion",
]);

function fromValue(v) {
  if (!v) return null;
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return parseInt(v.integerValue, 10);
  if ("doubleValue" in v) return v.doubleValue;
  if ("stringValue" in v) return v.stringValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(fromValue);
  if ("mapValue" in v) return fromFields(v.mapValue.fields || {});
  return null;
}
function fromFields(fields) {
  const o = {};
  for (const [k, v] of Object.entries(fields)) o[k] = fromValue(v);
  return o;
}

const local = JSON.parse(readFileSync(LOCAL, "utf8"));

let remote;
try {
  const db = await getDb();
  const snap = await db.collection("campaign").doc("posts").get();
  if (!snap.exists) {
    console.error("campaign/posts does not exist in Firestore.");
    process.exitCode = 2;
  }
  remote = snap.data() || {};
  console.log(`  (read via ${db.__via})`);
} catch (err) {
  console.error(credentialHelp());
  console.error(`  underlying error: ${err.message}
`);
  process.exitCode = 2;
}

if (remote) {

const localPosts = local.posts || [];
const remotePosts = remote.posts || [];
const localById = new Map(localPosts.map((p) => [p.id, p]));
const remoteById = new Map(remotePosts.map((p) => [p.id, p]));

const onlyLocal = localPosts.filter((p) => !remoteById.has(p.id)).map((p) => p.id);
const onlyRemote = remotePosts.filter((p) => !localById.has(p.id)).map((p) => p.id);

const contentDrift = [];
const remoteOnlyDrift = [];
for (const [id, lp] of localById) {
  const rp = remoteById.get(id);
  if (!rp) continue;
  for (const key of new Set([...Object.keys(lp), ...Object.keys(rp)])) {
    const a = JSON.stringify(lp[key] ?? null);
    const b = JSON.stringify(rp[key] ?? null);
    if (a === b) continue;
    (REMOTE_OWNED.has(key) ? remoteOnlyDrift : contentDrift).push({ id, key });
  }
}

console.log("\nposts.json  vs  Firestore campaign/posts\n");
console.log(`  local:  ${localPosts.length} posts`);
console.log(`  remote: ${remotePosts.length} posts`);
console.log(`  local _meta:  ${local._meta?.lastUpdatedAt || "—"} (${local._meta?.lastUpdatedBy || "—"})`);
console.log(`  remote _meta: ${remote._meta?.lastUpdatedAt || "—"} (${remote._meta?.lastUpdatedBy || "—"})`);

let drifted = false;

if (onlyRemote.length) {
  drifted = true;
  console.log(`\n  ONLY IN FIRESTORE (${onlyRemote.length}) — local file is behind:`);
  onlyRemote.forEach((id) => console.log(`    · ${id}`));
  console.log("    fix: node scripts/seed-firestore.mjs --pull");
}
if (onlyLocal.length) {
  drifted = true;
  console.log(`\n  ONLY IN LOCAL (${onlyLocal.length}) — never seeded:`);
  onlyLocal.forEach((id) => console.log(`    · ${id}`));
  console.log("    fix: node scripts/seed-firestore.mjs --posts");
}
if (contentDrift.length) {
  drifted = true;
  console.log(`\n  CONTENT DIFFERS (${contentDrift.length}) — copy/schedule edited in one place only:`);
  contentDrift.slice(0, 15).forEach((d) => console.log(`    · ${d.id}  →  ${d.key}`));
  if (contentDrift.length > 15) console.log(`    … and ${contentDrift.length - 15} more`);
}
if (remoteOnlyDrift.length) {
  console.log(`\n  (informational) ${remoteOnlyDrift.length} dashboard-owned field diffs — expected; --pull to mirror locally.`);
}

console.log(drifted ? "\nDRIFT FOUND — do not validate logic against the local file until resolved.\n" : "\nIn sync.\n");
  process.exitCode = drifted ? 1 : 0;
}
