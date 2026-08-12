// Mirror site/data/competitors.json → Firestore campaign/competitors.
// qcode's ops console reads the structured competitor list from that document
// (firestore://cipher-marketing-daveq/campaign/competitors), so re-run this
// whenever competitors.json changes (Brad's monthly intel refresh does).
//
// AUTH: this script used to PATCH the REST API with nothing but a web API key.
// Since commit e7f3f4b (2026-07-29) firestore.rules requires a marketingAdmin
// claim on every read and write, so that anonymous path returns 403 and this
// script could not have succeeded — the 2026-08-01 refresh failed here. It now
// goes through scripts/lib/firestore-access.mjs like every other campaign
// script, which authenticates as a service account and bypasses rules.
//
// Using the Admin SDK also removes the hand-rolled JSON → Firestore Value
// encoder this file used to carry; the SDK takes plain objects.
import { readFileSync } from 'node:fs';

import { getDb, credentialHelp } from './lib/firestore-access.mjs';

const data = JSON.parse(
  readFileSync(new URL('../site/data/competitors.json', import.meta.url), 'utf8')
);
data._meta = data._meta || {};
data._meta.mirroredAt = new Date().toISOString();

let db;
try {
  db = await getDb();
} catch (err) {
  console.error(`\nFirestore auth failed: ${err.message}`);
  console.error(credentialHelp());
  process.exit(1);
}

await db.collection('campaign').doc('competitors').set(data);

console.log(
  'campaign/competitors mirrored from site/data/competitors.json (' +
    (data.competitors ? data.competitors.length : 0) + ' competitors)'
);
