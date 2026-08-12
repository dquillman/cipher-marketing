// One-way mirror: CipherExam-tagged board todos (qcode ops-board.json) →
// campaign-state.json `boardPriorities` + Firestore campaign/state.
// The marketing dashboard's Today tab renders the strip read-only; the
// /codeq-board skill re-runs this after each board cycle so the month's
// compass is visible where the daily campaign work happens.
import { readFileSync, writeFileSync } from 'node:fs';

import { getDb, credentialHelp } from './lib/firestore-access.mjs';

const BOARD_PATH = 'G:/Users/daveq/qcode/src/lib/ops-board.json';
const STATE_PATH = new URL('../site/data/campaign-state.json', import.meta.url);

// The hand-rolled Firestore REST value codec that used to live here is gone —
// the Admin SDK reads and writes plain JS objects.

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
// Was an anonymous REST GET + PATCH. firestore.rules has required a
// marketingAdmin claim on every read and write since commit e7f3f4b
// (2026-07-29), so that path returned 403 and this mirror silently stopped
// working. Goes through the shared credential helper now, same as the other
// campaign scripts. Verify access with: node scripts/check-firestore-access.mjs
let db;
try {
  db = await getDb();
} catch (err) {
  console.error(`\nFirestore auth failed: ${err.message}`);
  console.error(credentialHelp());
  process.exit(1);
}

const docRef = db.collection('campaign').doc('state');
const snap = await docRef.get();
const live = snap.exists ? snap.data() : {};
live.boardPriorities = boardPriorities;
live._meta = live._meta || {};
live._meta.lastUpdatedAt = now;
live._meta.lastUpdatedBy = 'push-board-priorities';

await docRef.set(live);
console.log('Firestore campaign/state: boardPriorities mirrored.');
