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
// API-key REST call now returns 403 PERMISSION_DENIED. Credentials are
// resolved by scripts/lib/firestore-access.mjs — the same helper every other
// campaign script uses. See credentialHelp() there for setup.
//
// This script used to resolve credentials itself, reading only
// GOOGLE_APPLICATION_CREDENTIALS with no check that the key belonged to this
// project. On a machine where that variable points at a DIFFERENT project's
// service account, it authenticated as the wrong project and every write came
// back PERMISSION_DENIED — which is exactly how the 2026-08-01 intel refresh
// was silently lost. The shared helper prefers FIREBASE_SERVICE_ACCOUNT and
// hard-fails on a project mismatch instead of guessing.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, credentialHelp } from './lib/firestore-access.mjs';

const HERE       = dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = join(HERE, '../site/data/competitor-intel');
const REPORTS    = ['battlecard', 'deepdive', 'landscape'];

let db;
try {
  db = await getDb();
} catch (err) {
  console.error(`\nFirestore auth failed: ${err.message}`);
  console.error(credentialHelp());
  process.exit(1);
}

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
