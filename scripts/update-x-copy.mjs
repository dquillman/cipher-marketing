#!/usr/bin/env node
// Pushes the corrected copy in add-x-variants.mjs onto the X posts already in
// Firestore.
//
// add-x-variants.mjs is idempotent — it SKIPS any post whose id already exists,
// so editing copy there does not reach the dashboard. Run this after any copy
// edit (in particular the 280-character trims) to sync the live posts.
//
// Refuses to write anything if the local copy is over X's 280-character limit,
// and skips posts that have already been published.
//
// Usage:
//   node scripts/update-x-copy.mjs            # dry run — show the diff
//   node scripts/update-x-copy.mjs --apply    # write to Firestore

import { getDb, credentialHelp } from "./lib/firestore-access.mjs";
import { X_POSTS, CTA } from "./add-x-variants.mjs";
import { assertXCopyFits, xWeightedLength } from "./lib/x-length.mjs";

const COPY_BY_ID = new Map(
  X_POSTS.map((x) => [`x-${x.date}-${x.hook}`, { copy: x.copy, cta: CTA(x.hook) }])
);

async function main() {
  const apply = process.argv.includes("--apply");

  // Never push copy X would reject.
  assertXCopyFits([...COPY_BY_ID].map(([id, v]) => ({ id, copy: v.copy })));

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

  const data = doc.data();
  const posts = data.posts || [];

  let changed = 0;
  let published = 0;
  let same = 0;

  for (const post of posts) {
    const local = COPY_BY_ID.get(post.id);
    if (!local) continue;

    if (post.copy === local.copy) {
      same++;
      continue;
    }

    if (post.postedAt) {
      console.log(`  🔒 Already published, leaving alone: ${post.id}`);
      published++;
      continue;
    }

    console.log(
      `  ✏️  ${post.id}: ${xWeightedLength(post.copy || "")} → ${xWeightedLength(local.copy)} chars`
    );
    post.copy = local.copy;
    post.cta = local.cta;
    changed++;
  }

  console.log(
    `\n${changed} to update, ${same} unchanged, ${published} skipped (already published).`
  );

  if (changed === 0) {
    console.log("✅ Firestore already matches add-x-variants.mjs.");
    return;
  }

  if (!apply) {
    console.log("\nDry run — nothing written. Re-run with --apply to push these changes.");
    return;
  }

  try {
    await postsRef.update({ posts });
    console.log(`\n✅ Updated ${changed} X post(s) in Firestore.`);
    console.log("Refresh your dashboard to see the corrected copy.");
  } catch (err) {
    console.error("\n❌ Update failed:", err.message);
    if (err.code === 7) {
      console.error("\n🔒 Permission denied. Ensure your service account has Firestore write access.");
      console.error(credentialHelp());
    }
    process.exit(1);
  }
}

main();
