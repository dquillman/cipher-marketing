#!/usr/bin/env node
// PostToolUse hook — fires after Claude Code edits any file.
// When posts.json or campaign-state.json changes:
//   1. Rebuilds app.html (keeps local serve fresh)
//   2. Seeds Firestore (keeps the deployed Firebase app live)
//
// No redeployment needed — the hosted app reads Firestore at runtime,
// so seeding is enough to make changes appear immediately on the web.

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..", "site");
const DATA = join(SITE, "data");

const API_KEY  = "AIzaSyDDSPC14tdDzMfkDrYLFykg2CFOZK9B4Ts";
const PROJECT  = "cipher-marketing-daveq";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

// Read all of stdin
let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let filePath = "";
try {
  const payload = JSON.parse(raw);
  filePath = payload?.tool_input?.file_path ?? "";
} catch {
  process.exit(0); // not JSON — skip silently
}

const isDataFile =
  filePath.includes("posts.json") ||
  filePath.includes("campaign-state.json");

if (!isDataFile) process.exit(0);

// Step 1 — rebuild local app.html
try {
  execSync("node inline-assets.mjs && node build-app.mjs", {
    cwd: SITE,
    stdio: ["ignore", "pipe", "pipe"],
  });
  process.stderr.write("✓ dashboard rebuilt\n");
} catch (err) {
  process.stderr.write("✗ rebuild failed: " + err.message + "\n");
  // Still attempt Firestore sync even if local rebuild fails
}

// Step 2 — sync changed file to Firestore (merge-safe for posts)

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean")          return { booleanValue: val };
  if (typeof val === "number")           return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (typeof val === "string")           return { stringValue: val };
  if (Array.isArray(val))                return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function fromFirestoreValue(val) {
  if (!val || typeof val !== "object") return null;
  if ("nullValue"    in val) return null;
  if ("booleanValue" in val) return val.booleanValue;
  if ("integerValue" in val) return parseInt(val.integerValue, 10);
  if ("doubleValue"  in val) return val.doubleValue;
  if ("stringValue"  in val) return val.stringValue;
  if ("arrayValue"   in val) return (val.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue"     in val) {
    const obj = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) obj[k] = fromFirestoreValue(v);
    return obj;
  }
  return null;
}

async function upsert(docId, data) {
  const url = `${BASE_URL}/campaign/${docId}?key=${API_KEY}`;
  const fields = {};
  for (const [k, v] of Object.entries(data)) fields[k] = toFirestoreValue(v);
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore PATCH campaign/${docId} → ${res.status}: ${err}`);
  }
}

// For posts.json: read current Firestore state first and preserve any "posted"
// statuses that were set via the web dashboard — prevents Brad's local edits
// from accidentally reverting a post back to "scheduled".
async function mergePosts(localData) {
  try {
    const res = await fetch(`${BASE_URL}/campaign/posts?key=${API_KEY}`);
    if (!res.ok) return localData; // fetch failed — fall back to local as-is

    const doc = await res.json();
    const fsFields = {};
    for (const [k, v] of Object.entries(doc.fields || {})) fsFields[k] = fromFirestoreValue(v);

    const fsPostMap = {};
    for (const p of (fsFields.posts || [])) fsPostMap[p.id] = p;

    const mergedPosts = localData.posts.map((localPost) => {
      const fsPost = fsPostMap[localPost.id];
      if (fsPost && (fsPost.status === "posted" || fsPost.status === "published")) {
        // Keep Firestore's live status — web dashboard already marked this posted
        return { ...localPost, status: fsPost.status, postedAt: fsPost.postedAt ?? null, postUrl: fsPost.postUrl ?? null };
      }
      return localPost;
    });

    return { ...localData, posts: mergedPosts };
  } catch {
    return localData; // network error — use local data unchanged
  }
}

try {
  if (filePath.includes("posts.json")) {
    const local = JSON.parse(readFileSync(join(DATA, "posts.json"), "utf8"));
    const merged = await mergePosts(local);
    await upsert("posts", merged);
    process.stderr.write("✓ Firestore campaign/posts synced (merge-safe)\n");
  }
  if (filePath.includes("campaign-state.json")) {
    const data = JSON.parse(readFileSync(join(DATA, "campaign-state.json"), "utf8"));
    await upsert("state", data);
    process.stderr.write("✓ Firestore campaign/state synced\n");
  }
} catch (err) {
  process.stderr.write("✗ Firestore sync failed: " + err.message + "\n");
}
