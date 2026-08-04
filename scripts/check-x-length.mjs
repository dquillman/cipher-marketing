#!/usr/bin/env node
// Reports the X-weighted character count of every X post variant and flags any
// that exceed the 280-character limit (i.e. that X will refuse to post).
//
// Reads the local source of truth (scripts/add-x-variants.mjs). Pass --firestore
// to check what is actually live in campaign/posts instead — use that when you
// want to know whether the deployed drafts are postable.
//
// Usage:
//   node scripts/check-x-length.mjs
//   node scripts/check-x-length.mjs --firestore

import { X_POSTS } from "./add-x-variants.mjs";
import { checkXCopy, X_MAX_WEIGHTED_LENGTH } from "./lib/x-length.mjs";

async function fromFirestore() {
  const { getDb, credentialHelp } = await import("./lib/firestore-access.mjs");
  let db;
  try {
    db = await getDb();
  } catch (err) {
    console.error("❌ Firestore connection failed:", err.message);
    console.error(credentialHelp());
    process.exit(1);
  }

  const doc = await db.collection("campaign").doc("posts").get();
  if (!doc.exists) {
    console.error("❌ campaign/posts does not exist in Firestore");
    process.exit(1);
  }

  return (doc.data().posts || [])
    .filter((p) => p.channel === "x")
    .map((p) => ({ id: p.id, copy: p.copy || "", posted: p.status === "posted" }));
}

function fromSource() {
  return X_POSTS.map((x) => ({ id: `x-${x.date}-${x.hook}`, copy: x.copy }));
}

async function main() {
  const useFirestore = process.argv.includes("--firestore");
  const entries = useFirestore ? await fromFirestore() : fromSource();

  console.log(
    `\nChecking ${entries.length} X post(s) from ${useFirestore ? "Firestore" : "add-x-variants.mjs"} ` +
      `against the ${X_MAX_WEIGHTED_LENGTH}-char limit\n`
  );

  const results = entries.map(({ id, copy, posted }) => ({
    ...checkXCopy(copy, id),
    posted: !!posted,
  }));

  // An already-published post's stored copy is a historical record, not
  // something waiting to be posted — flagging it as a blocker is a false alarm.
  const overs = results.filter((r) => !r.ok && !r.posted);
  const postedOvers = results.filter((r) => !r.ok && r.posted);

  for (const r of results) {
    const mark = r.ok ? "✓" : r.posted ? "•" : "✗";
    const note = r.ok
      ? `${X_MAX_WEIGHTED_LENGTH - r.length} left`
      : r.posted
        ? `${r.over} over — already posted, record only`
        : `${r.over} OVER`;
    console.log(`  ${mark} ${String(r.length).padStart(3)}/280  ${r.id.padEnd(42)} ${note}`);
  }

  if (postedOvers.length > 0) {
    console.log(
      `\n⚠  ${postedOvers.length} published post(s) have stored copy over the limit, which means\n` +
        `   the stored text is NOT what actually went out — X would have rejected it.\n` +
        `   The dashboard record is inaccurate and the grader will grade the wrong copy:`
    );
    for (const r of postedOvers) console.log(`   • ${r.id}`);
  }

  if (overs.length === 0) {
    console.log(`\n✅ All ${results.length} X posts fit.`);
    return;
  }

  console.log(`\n❌ ${overs.length} post(s) cannot be published as written:`);
  for (const r of overs) console.log(`   • ${r.id} — cut at least ${r.over} characters`);
  console.log(
    `\nNote: shortening the URL will not help. X counts every link as exactly 23\n` +
      `characters regardless of length, so the UTM string is already free. Cut body copy.`
  );
  process.exitCode = 1;
}

main();
