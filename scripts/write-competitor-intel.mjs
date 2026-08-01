#!/usr/bin/env node
// Pushes the three competitor intel reports to Firestore `competitor_intel/*`.
//
// Content lives in site/data/competitor-intel/*.md — edit those, then run this.
// (Brad's monthly intel refresh regenerates the .md files, then runs this.)
//
//   node scripts/write-competitor-intel.mjs
//
// AUTH: as of commit e7f3f4b (2026-07-29) firestore.rules requires a
// `marketingAdmin` custom claim on ALL reads and writes, so the old
// API-key REST call now returns 403 PERMISSION_DENIED. This script uses
// firebase-admin instead, which talks to Firestore as a service account and
// bypasses security rules. Provide credentials one of these ways:
//
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json  (preferred)
//   — or —  application default credentials from `gcloud auth application-default login`
//
// Same credential path as scripts/grant-marketing-admin.mjs.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const HERE       = dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = join(HERE, '../site/data/competitor-intel');
const PROJECT_ID = 'cipher-marketing-daveq';
const REPORTS    = ['battlecard', 'deepdive', 'landscape'];

function credential() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath) return cert(JSON.parse(readFileSync(keyPath, 'utf8')));
  return applicationDefault();
}

if (!getApps().length) {
  initializeApp({ credential: credential(), projectId: PROJECT_ID });
}

const db           = getFirestore();
const generatedAt  = new Date().toISOString();

for (const id of REPORTS) {
  const content = readFileSync(join(REPORT_DIR, `${id}.md`), 'utf8');
  await db.collection('competitor_intel').doc(id).set(
    { content, generated_at: generatedAt },
    { merge: true }
  );
  console.log(`✓ wrote ${id} (${content.length} chars)`);
}

console.log(`\nAll ${REPORTS.length} reports written to Firestore (${generatedAt})`);
