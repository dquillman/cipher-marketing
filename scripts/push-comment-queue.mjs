#!/usr/bin/env node
// Writes Firestore campaign/commentQueue from a generated JSON file — the
// drafted comments shown on the Comments page (site/app.html, route="comments").
//
// This replaces the hand-authored scripts/seed-comment-queue.mjs. That file
// stays as the record of how the rules were derived on 2026-08-18; this one is
// what the daily `comment-scan` skill calls with a freshly scanned queue.
//
// Usage:
//   node scripts/push-comment-queue.mjs <queue.json>
//   node scripts/push-comment-queue.mjs <queue.json> --dry
//   node scripts/push-comment-queue.mjs <queue.json> --keep-baseline
//
// Input shape (the skill produces this):
//   {
//     "preparedAt": "2026-08-25T11:30:00.000Z",
//     "baseline": { "capturedAt": "...", "profileViewers": 17, "postImpressions": 1230 },
//     "items": [ { when, author, url, profile, age, postedAt, reactions,
//                  comments, hostSummary, why, comment } ],
//     "manual":  [ { author, url, why } ],   // video posts Dave must write live
//     "excluded": "one paragraph on what was rejected and why"
//   }
//
// Every rule enforced below is a real lesson, not style policing. Read the
// failure message before loosening one.

import { readFileSync } from "node:fs";
import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const KEEP_BASELINE = args.includes("--keep-baseline");
const REPLACE_MANUAL = args.includes("--replace-manual");
const file = args.find((a) => !a.startsWith("--"));

if (!file) {
  console.error("usage: node scripts/push-comment-queue.mjs <queue.json> [--dry] [--keep-baseline] [--replace-manual]");
  process.exit(1);
}

const doc = JSON.parse(readFileSync(file, "utf8"));

const MAX_HOST_COMMENTS = 20;
const MAX_HOST_AGE_DAYS = 5;

// US spelling, no exceptions (Dave, 2026-08-31 — he flagged "memorised").
// The audience is US-based PMP and Security+ candidates and PMI's own material
// is US-spelled, so a British spelling reads as not-from-here in a comment
// whose entire job is to sound like a peer in that room. Four slipped into one
// draft on the day the rule was set, all inside long reasoning sentences,
// which is exactly the register these comments are written in — so this is a
// gate, not a style note. Also recorded in site/data/brand-voice.md.
//
// Deliberately an explicit list rather than a blanket /ise$/: surprise,
// exercise, advise, revise, supervise, compromise, promise and franchise are
// all correct US spellings, and "analysis" and "emphasis" are correct nouns.
const BRITISH = [
  /\b(?:memoris|recognis|organis|prioritis|summaris|minimis|maximis|categoris|realis|apologis|specialis|standardis|optimis|utilis|normalis|generalis|penalis|formalis|criticis|emphasis|analys|practis)(?:e|es|ed|ing|ation)\b/gi,
  /\b(?:behaviour|favour|labour|honour|colour|rumour|neighbour)(?:s|ed|ing|al|ally)?\b/gi,
  /\b(?:defence|licence|offence|pretence)s?\b/gi,
  /\b(?:towards|backwards|forwards|upwards|downwards|afterwards)\b/gi,
  /\b(?:cancelled|cancelling|modelling|labelled|labelling|travelled|travelling|fuelled|marvellous)\b/gi,
  /\b(?:centre|theatre|metre|litre|programme)s?\b/gi,
  /\b(?:whilst|amongst)\b/gi,
];

function britishSpellings(text) {
  const hits = new Set();
  for (const rx of BRITISH) for (const m of String(text).matchAll(rx)) hits.add(m[0]);
  return [...hits];
}

// A LinkedIn activity id has the post's creation time in its top 42 bits, so a
// permalink is self-dating. Returns null when the url carries no activity urn.
function postedAtFromUrn(url) {
  const m = /urn:li:activity:(\d+)/.exec(url || "");
  if (!m) return null;
  try {
    const ms = Number(BigInt(m[1]) >> 22n);
    if (!Number.isFinite(ms) || ms <= 0) return null;
    return new Date(ms).toISOString();
  } catch {
    return null;
  }
}

function fail(msg) {
  console.error(`REJECTED: ${msg}`);
  process.exitCode = 1;
  throw new Error(msg);
}

function check(d) {
  if (!Array.isArray(d.items)) fail("no items array");
  if (!d.items.length) {
    console.log("queue is empty — nothing worth commenting on today.");
    console.log("That is a valid outcome. Do not lower the bar to fill the queue.");
    return false;
  }

  const seen = new Set();
  for (const it of d.items) {
    const who = it.author || "(no author)";

    if (!it.url || !/^https:\/\/www\.linkedin\.com\/feed\/update\//.test(it.url))
      fail(`bad or missing post URL for ${who}`);
    if (seen.has(it.url)) fail(`duplicate post URL for ${who}`);
    seen.add(it.url);

    if (!it.comment || it.comment.length < 120)
      fail(`comment too short for ${who} — under 120 chars is filler`);
    if (it.comment.length > 1250)
      fail(`comment too long for ${who} — LinkedIn caps comments at 1,250 characters`);

    // The comment is a reach play, not a pitch. A link or a product mention
    // turns it into an ad and burns the host's goodwill.
    if (/cipherexam|start free trial|check out my|https?:\/\//i.test(it.comment))
      fail(`comment for ${who} reads as a pitch or carries a link — rewrite it`);
    if (/^(great post|love this|so true|well said|thanks for sharing)/i.test(it.comment.trim()))
      fail(`comment for ${who} opens with filler`);

    const brit = britishSpellings(it.comment);
    if (brit.length)
      fail(`comment for ${who} uses British spelling: ${brit.join(", ")} — US spelling only`);

    if (typeof it.comments === "number" && it.comments > MAX_HOST_COMMENTS)
      fail(`${who}: host post already has ${it.comments} comments — buried on arrival`);

    // The age guard used to be `if (it.postedAt)`, so an item carrying only a
    // rounded `age` string ("5 days") skipped it entirely. That is how Mahmoud
    // Yousry sat in the queue on 2026-08-29 at a real 5.17 days, a day past the
    // window, having been queued on the rounded label. The permalink already
    // carries the true timestamp, so derive it rather than trusting the label,
    // and refuse the item when neither is available. An unmeasurable room is a
    // room you cannot say is alive.
    const postedAt = it.postedAt || postedAtFromUrn(it.url);
    if (!postedAt)
      fail(`${who}: no postedAt and no activity urn in the url — cannot check the ${MAX_HOST_AGE_DAYS}-day window`);
    const ageDays = (Date.now() - Date.parse(postedAt)) / 86400000;
    if (!Number.isFinite(ageDays))
      fail(`${who}: postedAt "${postedAt}" is not a readable time`);
    if (ageDays > MAX_HOST_AGE_DAYS)
      fail(`${who}: host post is ${ageDays.toFixed(1)} days old — dead room`);
    it.postedAt = postedAt;

    if (!it.why || it.why.length < 40)
      fail(`${who}: no stated reason this target is worth a comment`);
  }
  return true;
}

// A rejection is an expected outcome, not a crash — print the reason, not a
// stack trace, so the daily task reports something Dave can act on.
let hasItems;
try {
  hasItems = check(doc);
} catch {
  console.error("Queue not written. Fix the comment, not the validator.");
  process.exit(1);
}

console.log(`items      ${doc.items.length}`);
for (const it of doc.items) {
  console.log(
    `  ${String(it.when || "").padEnd(28)} ${String(it.author).padEnd(26)} ` +
      `${it.reactions ?? "?"}r/${it.comments ?? "?"}c  ${it.comment.length} chars`
  );
}
if (doc.manual?.length) {
  console.log(`\nwrite live (video posts, cannot be drafted blind): ${doc.manual.length}`);
  for (const m of doc.manual) console.log(`  ${m.author} — ${m.url}`);
}

if (DRY) {
  console.log("\n--- dry run, nothing written ---");
  for (const it of doc.items) console.log(`\n=== ${it.author} ===\n${it.comment}`);
  process.exit(0);
}

// ALWAYS write, even with nothing to show. Skipping the write leaves
// yesterday's queue sitting on the Comments page looking current, so a scan
// that broke is indistinguishable from a scan that honestly found nothing —
// which is exactly what happened on the 2026-08-26 run. The stamp is the
// difference between "checked today, nothing good" and "the scan is dead".
if (!doc.preparedAt) {
  console.error("REJECTED: no preparedAt — the page cannot show when this was scanned.");
  process.exit(1);
}
if (!hasItems && !doc.manual?.length) {
  console.log("nothing cleared the bar — writing an empty queue with today's stamp.");
}

let db;
try {
  db = await getDb();
} catch (e) {
  console.error("Could not reach Firestore:", e.message);
  console.error(credentialHelp?.() ?? "Run scripts/check-firestore-access.mjs for credential help.");
  process.exit(1);
}

// The baseline is the ONLY measurement of whether commenting works — profile
// viewers and followers before the campaign started. Overwriting it with
// today's number erases the comparison, so it is preserved unless the caller
// deliberately supplies a new one.
const ref = db.collection("campaign").doc("commentQueue");

// A ledger of posts Dave has ALREADY commented on. Without it the scan
// re-queues the same host post every morning until it ages out — the item
// still has a big audience and few comments, because our own comment does
// not change that shape much. Carried across every write; the scan reads it
// and skips those URLs.
{
  const prior = await ref.get();
  const ledger = (prior.exists ? prior.data()?.commentedOn : null) || [];
  const incoming = doc.commentedOn || [];
  const seen = new Set(ledger.map((e) => e.url));
  doc.commentedOn = ledger.concat(incoming.filter((e) => !seen.has(e.url)));
}
if (KEEP_BASELINE || !doc.baseline) {
  const existing = await ref.get();
  const prior = existing.exists ? existing.data()?.baseline : null;
  if (prior) doc.baseline = prior;
}

// Video posts Dave has to write live. `manual` is owned by whichever run last
// found one, and a caller that did not find any has no reason to know it
// exists — so a bare .set() silently deletes it. That is not hypothetical:
// on 2026-08-29 the monthly cipher-hashtag-bar-scan (09:14) wrote over the
// daily cipher-comment-scan's (05:30) queue and destroyed both Andrew Ramdayal
// targets, one of them a 15-reaction / ZERO-comment room at 16h that the scan
// had called the highest-leverage item it found that day. On the 1st of every
// month those two tasks are GUARANTEED to collide, 3h44m apart.
//
// Carried forward by url, exactly like commentedOn above, so the trap is shut
// for every caller rather than for whoever remembers to read the SKILL.
// Pass --replace-manual to deliberately drop entries that are no longer live.
{
  const prior = await ref.get();
  const kept = (prior.exists ? prior.data()?.manual : null) || [];
  const incoming = doc.manual || [];
  if (REPLACE_MANUAL) {
    doc.manual = incoming;
  } else {
    const seen = new Set(incoming.map((e) => e.url));
    doc.manual = incoming.concat(kept.filter((e) => !seen.has(e.url)));
    const revived = doc.manual.length - incoming.length;
    if (revived > 0) {
      console.log(`
carried forward ${revived} write-live target(s) already in the queue:`);
      for (const e of kept.filter((x) => !seen.has(x.url))) console.log(`  ${e.author} — ${e.url}`);
    }
  }
}

// Refuse to re-queue a thread Dave has already answered. The scan is told to
// skip these, but the validator is the backstop — being in the same thread
// twice reads as not remembering your own comment.
{
  const done = new Set((doc.commentedOn || []).map((e) => e.url));
  const dupes = (doc.items || []).filter((it) => done.has(it.url));
  if (dupes.length) {
    for (const d of dupes) console.error();
    doc.items = doc.items.filter((it) => !done.has(it.url));
  }
}

// Refuse to re-queue a thread Dave has already answered. The scan is told to
// skip these, but the validator is the backstop — turning up twice in the same
// thread reads as not remembering your own comment.
{
  const done = new Set((doc.commentedOn || []).map((e) => e.url));
  const dupes = (doc.items || []).filter((it) => done.has(it.url));
  for (const d of dupes) {
    console.error(`DROPPED ${d.author} — already commented on that post`);
  }
  if (dupes.length) doc.items = doc.items.filter((it) => !done.has(it.url));
}

await ref.set(doc);
console.log("\n✓ wrote campaign/commentQueue");
console.log("  Comments page subscribes live — no deploy needed for data changes.");
