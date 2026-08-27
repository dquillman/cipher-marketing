#!/usr/bin/env node
// Seeds Firestore with the current local posts.json + campaign-state.json.
// Talks to Firestore through firebase-admin (see scripts/lib/firestore-access.mjs),
// not the REST API. Check access any time with:
//   node scripts/check-firestore-access.mjs
//
// ⚠ STALE ASSUMPTION FIXED 2026-08-01: this said "no service account required
// (rules are open)". firestore.rules now requires an authenticated
// marketingAdmin for campaign/*, so unauthenticated REST reads and writes
// return HTTP 403 — every mode below (including --pull and the
// grade-preserving merge) needs a credential. Run with a service account for
// cipher-marketing-daveq, or make changes through the signed-in dashboard.
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
import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

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
//   - videoUrl/videoStatus/renderedAt            ← renderPostVideo Cloud Function
//
// Local file wins for every other field (copy, scheduledTime, examFocus, video,
// hook, cta) — that's the source of truth for content.
const GRADE_FIELDS  = ["metrics", "grade", "gradeNotes", "recommendations"];
const POSTED_FIELDS = ["postedAt", "postUrl"];
const VIDEO_FIELDS  = ["videoUrl", "videoStatus", "renderedAt", "videoJobId"];
const DASHBOARD_FIELDS = ["archived"];   // set from the dashboard, absent from posts.json

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
  const db = await getDb();
  const snap = await db.collection(collection).doc(docId).get();
  return snap.exists ? snap.data() : null;
}

async function upsert(collection, docId, data) {
  const db = await getDb();
  await db.collection(collection).doc(docId).set(data);
  return { ok: true };
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
  let preservedVideo = 0;

  const merged = {
    ...localPosts,
    posts: localPosts.posts.map(localPost => {
      const remote = remoteById.get(localPost.id);
      if (!remote) return localPost;
      const out = { ...localPost };
      let gradeChanged  = false;
      let postedChanged = false;
      let videoChanged  = false;

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

      // VIDEO_FIELDS: prefer remote if non-empty — a re-seed must never wipe
      // out a video the Generate Video pipeline already attached.
      for (const f of VIDEO_FIELDS) {
        if (hasRealValue(remote[f])) {
          out[f] = remote[f];
          videoChanged = true;
        }
      }

      // DASHBOARD_FIELDS: state the dashboard writes and posts.json does not
      // track. Local-file-wins would silently DELETE these on every re-seed —
      // which is exactly what happened to archived on 2026-08-19, wiping the
      // flag off all six skipped posts and making the Show-archived toggle
      // vanish. Preserve remote unless the local file has a real value.
      for (const f of DASHBOARD_FIELDS) {
        if (!hasRealValue(localPost[f]) && hasRealValue(remote[f])) {
          out[f] = remote[f];
        }
      }

      // status: Firestore "posted" beats local "scheduled"/"draft" — once posted,
      // a re-seed must NEVER demote it back. Going the other direction (remote
      // older than local) is rare but still safe to override locally.
      //
      // "skipped" is a deliberate TERMINAL decision, not a rung on the
      // draft→scheduled→posted ladder. It used to score -1 via the `?? -1`
      // fallback below, which meant a remote "scheduled" (1) outranked a local
      // "skipped" (-1) and every re-seed silently un-skipped the post. Skips
      // are now terminal on both sides and are never demoted.
      const STATUS_ORDER = { draft: 0, scheduled: 1, posted: 2 };
      if (localPost.status === "skipped") {
        // Local skip wins outright — leave out.status as the local "skipped".
      } else if (remote.status === "skipped") {
        out.status = "skipped";
        for (const f of ["skippedReason", "skippedAt"]) {
          if (hasRealValue(remote[f])) out[f] = remote[f];
        }
        postedChanged = true;
      } else {
        const rOrd = STATUS_ORDER[remote.status] ?? -1;
        const lOrd = STATUS_ORDER[localPost.status] ?? -1;
        if (rOrd > lOrd) {
          out.status = remote.status;
          postedChanged = true;
        }
      }

      if (gradeChanged)  preservedGrade++;
      if (postedChanged) preservedPosted++;
      if (videoChanged)  preservedVideo++;

      if (gradeChanged && postedChanged) {
        console.log(`     · preserved grade + post-status for ${localPost.id} (status=${out.status}, grade=${out.grade ?? "—"})`);
      } else if (gradeChanged) {
        console.log(`     · preserved grade for ${localPost.id} (grade=${out.grade ?? "—"})`);
      } else if (postedChanged) {
        console.log(`     · preserved post-status for ${localPost.id} (status=${out.status}, postUrl=${out.postUrl ? "yes" : "no"})`);
      }
      if (videoChanged) {
        console.log(`     · preserved video for ${localPost.id} (videoStatus=${out.videoStatus ?? "—"})`);
      }
      return out;
    }),
  };

  if (preservedGrade === 0 && preservedPosted === 0 && preservedVideo === 0) {
    console.log("     · nothing to preserve from Firestore");
  } else {
    console.log(`     · preserved: ${preservedGrade} grade${preservedGrade === 1 ? "" : "s"}, ${preservedPosted} post-status update${preservedPosted === 1 ? "" : "s"}, ${preservedVideo} video${preservedVideo === 1 ? "" : "s"}`);
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

    // Every post needs BOTH date fields. The dashboard derives a post's day
    // from `scheduled` and falls back to `scheduledTime`; when a post carries
    // only one, pages that read the other silently disagree about what is due.
    // That shipped: on 2026-08-26 the Publish page listed two posts for the day
    // and the Today page listed one, because li-wed-2026-08-26-llm-compare had
    // a scheduledTime and no scheduled date.
    const undated = mergedPosts.posts.filter(
      (p) => !p.archived && (!p.scheduled || !p.scheduledTime)
    );
    if (undated.length) {
      console.error("\n  ABORT — posts missing a date field:\n");
      for (const p of undated) {
        console.error(
          `   - ${p.id}: scheduled=${p.scheduled || "MISSING"} scheduledTime=${p.scheduledTime || "MISSING"}`
        );
      }
      console.error("\n  Set both, then re-run. Nothing was written.\n");
      process.exit(1);
    }

    await upsert("campaign", "posts", mergedPosts);
    console.log(`  ✓  campaign/posts  (${mergedPosts.posts.length} posts)`);
  } else {
    console.log("  ⤳ skipping campaign/posts (--state)");
  }

  if (!POSTS_ONLY) {
    const state = JSON.parse(readFileSync(join(DATA, "campaign-state.json"), "utf8"));
    // Stamp the sync time. The dashboard header badge ("Synced · <date>") reads
    // _meta.lastUpdatedAt from this doc; relying on every editor to bump it by
    // hand left the badge stuck on Aug 1 while the data changed daily (found
    // 2026-08-08). The stamp is written back to the local file too, so file and
    // Firestore never disagree about when they were last aligned.
    state._meta = state._meta || {};
    state._meta.lastUpdatedAt = new Date().toISOString();
    state._meta.lastUpdatedBy = "seed-firestore";
    writeFileSync(join(DATA, "campaign-state.json"), JSON.stringify(state, null, 2) + "\n");
    await upsert("campaign", "state", state);
    console.log("  ✓  campaign/state (synced " + state._meta.lastUpdatedAt + ")");
  } else {
    console.log("  ⤳ skipping campaign/state (--posts)");
  }

  console.log("\nDone. View at: https://console.firebase.google.com/project/cipher-marketing-daveq/firestore");
}

// ---- Entrypoint ----

try {
  if (PULL_ONLY) await runPull();
  else await runSeed();
} catch (err) {
  if (/credential|PERMISSION_DENIED|UNAUTHENTICATED|project/i.test(err.message)) {
    console.error(credentialHelp());
  }
  console.error(`  error: ${err.message}
`);
  process.exitCode = 1;
}
