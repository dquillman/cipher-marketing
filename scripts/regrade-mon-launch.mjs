#!/usr/bin/env node
// One-off: push the regraded li-mon-2026-05-11-launch post (Week 1 meta-pattern lock-in)
// to Firestore. Uses the same toFs serializer pattern as seed-firestore.mjs.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "../site/data");

const API_KEY  = "AIzaSyDDSPC14tdDzMfkDrYLFykg2CFOZK9B4Ts";
const PROJECT  = "cipher-marketing-daveq";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

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

const posts = JSON.parse(readFileSync(join(DATA, "posts.json"), "utf-8"));
await upsert("campaign", "posts", posts);
console.log("✓ campaign/posts pushed to Firestore (Mon launch regrade + Week 1 meta-lessons)");
