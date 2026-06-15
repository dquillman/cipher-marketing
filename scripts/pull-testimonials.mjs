#!/usr/bin/env node
// Pull admin-approved, user-consented CipherExam testimonials from the PUBLIC
// Firestore collection `published_testimonials` (project exam-coach-ai-platform)
// and write them to site/data/testimonials.json for the marketing dashboard.
//
// The collection is public-read, so this is a plain unauthenticated GET against
// the Firestore REST API — no Firebase Admin creds, no service account, no API
// key required. Each source doc has ONLY safe, consent-cleared fields:
//   firstName (string), quote (string), rating (number 1–5),
//   examName (string), publishedAt (timestamp)
//
// READ-ONLY: this script never writes to the testimonials collection. It only
// consumes from it. Re-run whenever Brad wants fresh quotes for posts/ads.
//
// Usage:
//   node scripts/pull-testimonials.mjs
import { writeFileSync } from 'node:fs';

const PROJECT = 'exam-coach-ai-platform';
const COLLECTION = 'published_testimonials';
const ENDPOINT =
  `https://firestore.googleapis.com/v1/projects/${PROJECT}` +
  `/databases/(default)/documents/${COLLECTION}?pageSize=300`;

const OUT_PATH = new URL('../site/data/testimonials.json', import.meta.url);

// ---- Firestore REST value decoder (mirrors push-board-priorities.mjs) ----
function dec(v) {
  if (v == null || typeof v !== 'object') return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('mapValue' in v) return decFields(v.mapValue.fields);
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(dec);
  return null;
}
function decFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields ?? {})) out[k] = dec(v);
  return out;
}

// Firestore REST paginates with nextPageToken. Walk every page so we never
// silently truncate once there are more than `pageSize` approved testimonials.
async function fetchAllDocuments() {
  const docs = [];
  let pageToken = null;
  do {
    const url = pageToken ? `${ENDPOINT}&pageToken=${encodeURIComponent(pageToken)}` : ENDPOINT;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Firestore GET ${COLLECTION} failed:`, res.status, await res.text());
      process.exit(1);
    }
    const json = await res.json();
    for (const d of json.documents ?? []) docs.push(d);
    pageToken = json.nextPageToken ?? null;
  } while (pageToken);
  return docs;
}

// Doc resource name → bare doc id (last path segment).
function docId(name) {
  return typeof name === 'string' ? name.split('/').pop() : null;
}

const rawDocs = await fetchAllDocuments();

const testimonials = rawDocs
  .map((doc) => {
    const f = decFields(doc.fields);
    return {
      id: docId(doc.name),
      firstName: f.firstName ?? '',
      quote: f.quote ?? '',
      rating: typeof f.rating === 'number' ? f.rating : Number(f.rating) || null,
      examName: f.examName ?? '',
      publishedAt: f.publishedAt ?? null,
    };
  })
  // Defensive: only keep entries that actually carry a quote.
  .filter((t) => t.quote && t.quote.trim())
  // Newest first.
  .sort((a, b) => String(b.publishedAt ?? '').localeCompare(String(a.publishedAt ?? '')));

const out = {
  _meta: {
    source: `firestore://${PROJECT}/${COLLECTION} (public-read REST)`,
    pulledAt: new Date().toISOString(),
    pulledBy: 'pull-testimonials',
    count: testimonials.length,
  },
  testimonials,
};

writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');

if (testimonials.length === 0) {
  console.log(
    `No published testimonials yet — wrote empty array to ${OUT_PATH.pathname}.\n` +
      '(Expected if none have been admin-approved + consented yet.)'
  );
} else {
  console.log(
    `Wrote ${testimonials.length} testimonial${testimonials.length === 1 ? '' : 's'} to ${OUT_PATH.pathname}` +
      ` (newest: ${testimonials[0].firstName} · ${testimonials[0].examName}).`
  );
}
