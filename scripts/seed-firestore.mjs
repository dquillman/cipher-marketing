#!/usr/bin/env node
// Seeds Firestore with the current local posts.json + campaign-state.json.
// Uses the Firestore REST API — no service account required (rules are open).
// Safe to re-run — overwrites the Firestore docs with local data.
//
// Usage:  node scripts/seed-firestore.mjs

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "../site/data");

const API_KEY   = "AIzaSyDDSPC14tdDzMfkDrYLFykg2CFOZK9B4Ts";
const PROJECT   = "cipher-marketing-daveq";
const BASE_URL  = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

// Convert a plain JS value to Firestore REST value format
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

const posts = JSON.parse(readFileSync(join(DATA, "posts.json"), "utf8"));
const state = JSON.parse(readFileSync(join(DATA, "campaign-state.json"), "utf8"));

console.log("Seeding Firestore…");

await upsert("campaign", "posts", posts);
console.log(`  ✓  campaign/posts  (${posts.posts.length} posts)`);

await upsert("campaign", "state", state);
console.log("  ✓  campaign/state");

console.log("\nDone. View at: https://console.firebase.google.com/project/cipher-marketing-daveq/firestore");
