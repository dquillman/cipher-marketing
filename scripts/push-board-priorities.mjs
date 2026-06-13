// One-way mirror: CipherExam-tagged board todos (qcode ops-board.json) →
// campaign-state.json `boardPriorities` + Firestore campaign/state.
// The marketing dashboard's Today tab renders the strip read-only; the
// /codeq-board skill re-runs this after each board cycle so the month's
// compass is visible where the daily campaign work happens.
import { readFileSync, writeFileSync } from 'node:fs';

const BOARD_PATH = 'G:/Users/daveq/qcode/src/lib/ops-board.json';
const STATE_PATH = new URL('../site/data/campaign-state.json', import.meta.url);
const KEY = 'AIzaSyDDSPC14tdDzMfkDrYLFykg2CFOZK9B4Ts';
const DOC_URL =
  'https://firestore.googleapis.com/v1/projects/cipher-marketing-daveq' +
  '/databases/(default)/documents/campaign/state?key=' + KEY;

// ---- Firestore REST value codec ----
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

// ---- Build the boardPriorities block from the qcode board file ----
const board = JSON.parse(readFileSync(BOARD_PATH, 'utf8'));
const items = (board.todos ?? [])
  .filter((t) => t.project === 'CipherExam')
  .map((t) => ({ priority: t.p ?? '', text: t.t ?? '' }))
  .filter((t) => t.text)
  .sort((a, b) => a.priority.localeCompare(b.priority));

if (items.length === 0) {
  console.error('No CipherExam todos found in ops-board.json — nothing mirrored.');
  process.exit(1);
}

const now = new Date().toISOString();
const boardPriorities = {
  cycleDate: board._meta?.cycleDate ?? null,
  mirroredAt: now,
  source: 'qcode ops-board.json (codeq-board cycle)',
  items,
};

// ---- 1. Local canonical state file ----
const state = JSON.parse(readFileSync(STATE_PATH, 'utf8'));
state.boardPriorities = boardPriorities;
state._meta = state._meta || {};
state._meta.lastUpdatedAt = now;
writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf8');
console.log(`campaign-state.json: boardPriorities set (${items.length} items, cycle ${boardPriorities.cycleDate})`);

// ---- 2. Live Firestore doc (read-merge-write so nothing else is lost) ----
const getRes = await fetch(DOC_URL);
if (!getRes.ok) {
  console.error('Firestore GET failed:', getRes.status, await getRes.text());
  process.exit(1);
}
const live = decFields((await getRes.json()).fields);
live.boardPriorities = boardPriorities;
live._meta = live._meta || {};
live._meta.lastUpdatedAt = now;
live._meta.lastUpdatedBy = 'push-board-priorities';

const patchRes = await fetch(DOC_URL, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fields: Object.fromEntries(Object.entries(live).map(([k, v]) => [k, enc(v)])) }),
});
if (!patchRes.ok) {
  console.error('Firestore PATCH failed:', patchRes.status, await patchRes.text());
  process.exit(1);
}
console.log('Firestore campaign/state: boardPriorities mirrored.');
