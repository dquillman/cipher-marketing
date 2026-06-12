// Mirror site/data/competitors.json → Firestore campaign/competitors.
// qcode's ops console reads the structured competitor list from that document
// (firestore://cipher-marketing-daveq/campaign/competitors), so re-run this
// whenever competitors.json changes (Brad's monthly intel refresh does).
import { readFileSync } from 'node:fs';

const KEY = 'AIzaSyDDSPC14tdDzMfkDrYLFykg2CFOZK9B4Ts';
const ENDPOINT =
  'https://firestore.googleapis.com/v1/projects/cipher-marketing-daveq' +
  '/databases/(default)/documents/campaign/competitors?key=' + KEY;

// Plain JSON → Firestore REST Value encoding.
function enc(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
}

const data = JSON.parse(
  readFileSync(new URL('../site/data/competitors.json', import.meta.url), 'utf8')
);
data._meta = data._meta || {};
data._meta.mirroredAt = new Date().toISOString();

const body = JSON.stringify({
  fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, enc(v)])),
});
const res = await fetch(ENDPOINT, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body,
});
if (!res.ok) {
  console.error('PATCH failed:', res.status, await res.text());
  process.exit(1);
}
console.log(
  'campaign/competitors mirrored from site/data/competitors.json (' +
    (data.competitors ? data.competitors.length : 0) + ' competitors)'
);
