#!/usr/bin/env node
// Makes each August X post render identically to its LinkedIn sibling in the
// dashboard by copying the sibling's MEDIA fields (video/image/canva) onto it.
//
// Pairing is by `hook`: every X post I created shares its hook with exactly one
// LinkedIn post (the-exam-changed, experience-trap, ...). The dashboard's card
// buttons (Copy / Approve / Ask Brad to revise / video player + Preview /
// Download) are driven by `status` + these media fields, NOT by channel — so
// once the media fields match, the cards look and behave the same.
//
// SELF-DIAGNOSING: it copies whatever media keys the LinkedIn sibling actually
// has (it does not assume specific field names) and prints a full before/after.
// IDEMPOTENT + SAFE to re-run.
//
// Usage:
//   node scripts/match-x-to-li-media.mjs

import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

// A key is a "media" key if it is one of these OR starts with video/canva.
const EXPLICIT_MEDIA_KEYS = new Set([
  "imageUrl",
  "thumbnailUrl",
  "posterUrl",
  "canvaCandidate",
]);
function isMediaKey(k) {
  if (EXPLICIT_MEDIA_KEYS.has(k)) return true;
  return /^video/i.test(k) || /^canva/i.test(k);
}

async function main() {
  let db;
  try {
    db = await getDb();
  } catch (err) {
    console.error("❌ Firestore connection failed:", err.message);
    console.error(credentialHelp());
    process.exit(1);
  }

  console.log(`🔗 Connected to Firestore via ${db.__via}\n`);

  const postsRef = db.collection("campaign").doc("posts");
  const doc = await postsRef.get();
  if (!doc.exists) {
    console.error("❌ campaign/posts document does not exist in Firestore");
    process.exit(1);
  }

  const posts = (doc.data() || {}).posts || [];

  // Index LinkedIn August posts by hook.
  const liByHook = new Map();
  for (const p of posts) {
    if (p.channel === "linkedin" && String(p.id).startsWith("li-2026-08-") && p.hook) {
      liByHook.set(p.hook, p);
    }
  }

  console.log(`Found ${liByHook.size} August LinkedIn posts to mirror from.\n`);

  let updated = 0;
  let noSibling = 0;

  for (const x of posts) {
    if (x.channel !== "x" || !String(x.id).startsWith("x-2026-08-")) continue;

    const li = liByHook.get(x.hook);
    if (!li) {
      console.log(`  ⚠️  ${x.id}: no LinkedIn sibling with hook "${x.hook}" — skipped`);
      noSibling++;
      continue;
    }

    // Media keys currently on the X post (to be replaced) and on the LI sibling.
    const xMediaBefore = Object.keys(x).filter(isMediaKey);
    const liMediaKeys = Object.keys(li).filter(isMediaKey);

    // 1) Remove existing media keys from X so we end up identical to LI.
    for (const k of xMediaBefore) delete x[k];
    // 2) Copy LI's media keys onto X.
    for (const k of liMediaKeys) x[k] = li[k];

    console.log(`  ✓ ${x.id}  (hook: ${x.hook})`);
    console.log(`      from LI sibling ${li.id}`);
    console.log(`      media before: ${xMediaBefore.length ? xMediaBefore.join(", ") : "(none)"}`);
    console.log(`      media after : ${liMediaKeys.length ? liMediaKeys.join(", ") : "(none — LI post is text-only)"}`);
    updated++;
  }

  if (updated === 0) {
    console.log("\n⚠️  No X posts updated.");
    process.exit(0);
  }

  await postsRef.update({ posts });
  console.log(`\n✅ Synced media fields onto ${updated} X post(s) (${noSibling} had no sibling).`);

  // Verification read-back
  console.log(`\n🔎 Verification — video-related fields per August X post:`);
  const verify = await postsRef.get();
  const vposts = (verify.data() || {}).posts || [];
  vposts
    .filter((p) => p.channel === "x" && String(p.id).startsWith("x-2026-08-"))
    .forEach((p) => {
      const vs = p.videoStatus || "(no videoStatus)";
      const vu = p.videoUrl ? "has videoUrl" : "(no videoUrl)";
      const vf = p.video || "(no video file)";
      console.log(`  ${p.id}: status=${p.status} | videoStatus=${vs} | ${vu} | video=${vf}`);
    });

  console.log(`\nRefresh the dashboard — X cards should now match their LinkedIn siblings.`);
}

main();
