#!/usr/bin/env node
// Seeds Firestore with the current local posts.json + campaign-state.json.
// Uses the Firestore REST API — no service account required (rules are open).
//
// IMPORTANT: For campaign/posts this script MERGES grade fields from the live
// Firestore doc into the local data before pushing, so seeding to update
// drafts/scheduling does NOT wipe out grades submitted via the dashboard.
//   - Preserved per-post fields: metrics, grade, gradeNotes, recommendations,
//     postedAt, postUrl, status (if Firestore status is "posted" but local is older)
//   - Everything else (copy, scheduledTime, examFocus, video, hook, cta…) takes
//     local-file-wins precedence — that's the source of truth for content.
//
// Usage:
//   node scripts/seed-firestore.mjs            # seed posts + state (merging grades)
//   node scripts/seed-firestore.mjs --state    # state only, skip posts
//   node scripts/seed-firestore.mjs --posts    # posts only, skip state
//   node scripts/seed-firestore.mjs --pull     # pull-only: copy Firestore grades
//                                              # back into local posts.json
//                                              # (no Firestore writes)

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "../site/data");

const API_KEY   = "AIzaSyDDSPC14tdDzMfkDrYLFykg2CFOZK9B4Ts";
const PROJECT   = "cipher-marketing-daveq";
const BASE_URL  = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

const args = new Set(process.argv.slice(2));
const STATE_ONLY = args.has("--state");
const POSTS_ONLY = args.has("--posts");
const PULL_ONLY  = args.has("--pull");

// Fields the dashboard or Cloud Function writes to Firestore that the local
// posts.json does NOT track. These must be preserved on every re-seed so that
// "Mark Posted" + grading actions taken through the UI survive.
//
//   - metrics/grade/gradeNotes/recommendations  ← gradePost Cloud Function
//   - status (only when Firestore = "posted")   ← Dashboard "Mark Posted" button
//   - postedAt, postUrl                          ← Dashboard "Mark Posted" button
//
// Local file wins for every other field (copy, scheduledTime, examFocus, video,
// hook, cta) — that's the source of truth for content.
const GRADE_FIELDS  = ["metrics", "grade", "gradeNotes", "recommendations"];
const POSTED_FIELDS = ["postedAt", "postUrl"];

// ---- Firestore REST <-> JS conversion ----

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean")          return { booleanValue: val };
  if (typeof val === "number") {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === "string")           return { stringValue: val };
  if (Array.isArray(val))                return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreDoc(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) fields[k] = toFirestoreValue(v);
  return { fields };
}

function fromFirestoreValue(v) {
  if (!v) return null;
  if ("nullValue" in v)   return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return parseInt(v.integerValue, 10);
  if ("doubleValue" in v)  return v.doubleValue;
  if ("stringValue" in v)  return v.stringValue;
  if ("arrayValue" in v)   return (v.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue" in v)     return fromFirestoreFields(v.mapValue.fields || {});
  return null;
}

function fromFirestoreFields(fields) {
  const obj = {};
  for (const [k, v] of Object.entries(fields)) obj[k] = fromFirestoreValue(v);
  return obj;
}

// ---- REST ops ----

async function getDoc(collection, docId) {
  const url = `${BASE_URL}/${collection}/${docId}?key=${API_KEY}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore GET ${collection}/${docId} → ${res.status}: ${err}`);
  }
  const json = await res.json();
  return fromFirestoreFields(json.fields || {});
}

async function upsert(collection, docId, data) {
  const url = `${BASE_URL}/${collection}/${docId}?key=${API_KEY}`;
  const body = JSON.stringify(toFirestoreDoc(data));
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore PATCH ${collection}/${docId} → ${res.status}: ${err}`);
  }
  return res.json();
}

// ---- Merge logic ----

function hasRealValue(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === "string" && v.trim() === "") return false;
  if (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0) return false;
  return true;
}

// Returns a posts doc where each post has Firestore-side fields merged in.
// Firestore wins for GRADE_FIELDS + POSTED_FIELDS + status (if remote is "posted").
// Local wins for everything else. Logs every preserved field so seeding is
// observable.
function mergePostsPreservingGrades(localPosts, remotePosts) {
  if (!remotePosts || !Array.isArray(remotePosts.posts)) return localPosts;
  const remoteById = new Map(remotePosts.posts.map(p => [p.id, p]));
  let preservedGrade = 0;
  let preservedPosted = 0;

  const merged = {
    ...localPosts,
    posts: localPosts.posts.map(localPost => {
      const remote = remoteById.get(localPost.id);
      if (!remote) return localPost;
      const out = { ...localPost };
      let gradeChanged  = false;
      let postedChanged = false;

      // GRADE_FIELDS: prefer remote if non-empty
      for (const f of GRADE_FIELDS) {
        if (hasRealValue(remote[f])) {
          out[f] = remote[f];
          gradeChanged = true;
        }
      }

      // POSTED_FIELDS: prefer remote if non-empty
      for (const f of POSTED_FIELDS) {
        if (hasRealValue(remote[f])) {
          out[f] = remote[f];
          postedChanged = true;
        }
      }

      // status: Firestore "posted" beats local "scheduled"/"draft" — once posted,
      // a re-seed must NEVER demote it back. Going the other direction (remote
      // older than local) is rare but still safe to override locally.
      const STATUS_ORDER = { draft: 0, scheduled: 1, posted: 2 };
      const rOrd = STATUS_ORDER[remote.status] ?? -1;
      const lOrd = STATUS_ORDER[localPost.status] ?? -1;
      if (rOrd > lOrd) {
        out.status = remote.status;
        postedChanged = true;
      }

      if (gradeChanged)  preservedGrade++;
      if (postedChanged) preservedPosted++;

      if (gradeChanged && postedChanged) {
        console.log(`     · preserved grade + post-status for ${localPost.id} (status=${out.status}, grade=${out.grade ?? "—"})`);
      } else if (gradeChanged) {
        console.log(`     · preserved grade for ${localPost.id} (grade=${out.grade ?? "—"})`);
      } else if (postedChanged) {
        console.log(`     · preserved post-status for ${localPost.id} (status=${out.status}, postUrl=${out.postUrl ? "yes" : "no"})`);
      }
      return out;
    }),
  };

  if (preservedGrade === 0 && preservedPosted === 0) {
    console.log("     · nothing to preserve from Firestore");
  } else {
    console.log(`     · preserved: ${preservedGrade} grade${preservedGrade === 1 ? "" : "s"}, ${preservedPosted} post-status update${preservedPosted === 1 ? "" : "s"}`);
  }
  return merged;
}

// ---- Modes ----

async function runPull() {
  console.log("Pulling Firestore grades back into local posts.json…");
  const remote = await getDoc("campaign", "posts");
  if (!remote) {
    console.log("  Firestore campaign/posts not found — nothing to pull.");
    return;
  }
  const localPath = join(DATA, "posts.json");
  const local = JSON.parse(readFileSync(localPath, "utf8"));
  const merged = mergePostsPreservingGrades(local, remote);
  // Bump _meta and persist
  merged._meta = {
    ...(merged._meta || {}),
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: "seed-firestore --pull",
  };
  writeFileSync(localPath, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`  ✓  wrote ${localPath}`);
}

async function runSeed() {
  console.log("Seeding Firestore…");

  if (!STATE_ONLY) {
    const localPosts = JSON.parse(readFileSync(join(DATA, "posts.json"), "utf8"));
    console.log("  Fetching live campaign/posts to preserve grades…");
    const remotePosts = await getDoc("campaign", "posts");
    const mergedPosts = mergePostsPreservingGrades(localPosts, remotePosts);
    await upsert("campaign", "posts", mergedPosts);
    console.log(`  ✓  campaign/posts  (${mergedPosts.posts.length} posts)`);
  } else {
    console.log("  ⤳ skipping campaign/posts (--state)");
  }

  if (!POSTS_ONLY) {
    const state = JSON.parse(readFileSync(join(DATA, "campaign-state.json"), "utf8"));
    await upsert("campaign", "state", state);
    console.log("  ✓  campaign/state");
  } else {
    console.log("  ⤳ skipping campaign/state (--posts)");
  }

  console.log("\nDone. View at: https://console.firebase.google.com/project/cipher-marketing-daveq/firestore");
}

// ---- Entrypoint ----

if (PULL_ONLY) {
  await runPull();
} else {
  await runSeed();
}
