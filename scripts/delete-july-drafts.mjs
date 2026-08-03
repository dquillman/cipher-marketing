#!/usr/bin/env node
// Deletes the 8 past-dated July draft posts from Firestore.
// Run this once after merging the corresponding repo PR that removed them from posts.json.
//
// Requires a Firebase service account credential (see lib/firestore-access.mjs).
//
// Usage:
//   node scripts/delete-july-drafts.mjs

import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

const POST_IDS_TO_DELETE = [
  "li-mon-2026-07-20-all-four-plausible",
  "x-mon-2026-07-20-all-four-plausible",
  "li-wed-2026-07-22-best-first-most",
  "x-wed-2026-07-22-best-first-most",
  "li-fri-2026-07-24-experience-trap",
  "x-fri-2026-07-24-experience-trap",
  "li-mon-2026-07-27-eco-change",
  "x-mon-2026-07-27-eco-change",
];

async function main() {
  let db;
  try {
    db = await getDb();
  } catch (err) {
    console.error("❌ Firestore connection failed:", err.message);
    console.error(credentialHelp());
    process.exit(1);
  }

  console.log(`🔗 Connected to Firestore via ${db.__via}`);
  console.log(`\n🗑️  Deleting ${POST_IDS_TO_DELETE.length} July draft posts from campaign/posts...\n`);

  const postsRef = db.collection("campaign").doc("posts");
  let deleted = 0;
  let notFound = 0;

  try {
    // Read current posts document
    const doc = await postsRef.get();
    if (!doc.exists) {
      console.error("❌ campaign/posts document does not exist in Firestore");
      process.exit(1);
    }

    const data = doc.data();
    const posts = data.posts || [];
    const originalCount = posts.length;

    console.log(`📊 Current post count in Firestore: ${originalCount}`);

    // Filter out the posts to delete
    const remainingPosts = posts.filter(p => {
      const shouldDelete = POST_IDS_TO_DELETE.includes(p.id);
      if (shouldDelete) {
        console.log(`  ✓ Deleting: ${p.id} (${p.channel} | ${p.examFocus} | ${p.scheduled})`);
        deleted++;
      }
      return !shouldDelete;
    });

    // Check if any IDs were not found
    const foundIds = posts.filter(p => POST_IDS_TO_DELETE.includes(p.id)).map(p => p.id);
    const missingIds = POST_IDS_TO_DELETE.filter(id => !foundIds.includes(id));
    notFound = missingIds.length;

    if (missingIds.length > 0) {
      console.log(`\n⚠️  ${missingIds.length} post(s) not found in Firestore (may have been deleted already):`);
      missingIds.forEach(id => console.log(`  - ${id}`));
    }

    if (deleted === 0) {
      console.log("\n✅ No posts to delete (all IDs already removed)");
      process.exit(0);
    }

    // Update Firestore with remaining posts
    await postsRef.update({ posts: remainingPosts });

    console.log(`\n✅ Deleted ${deleted} post(s) from Firestore`);
    console.log(`📊 New post count: ${remainingPosts.length} (was ${originalCount})`);

  } catch (err) {
    console.error("\n❌ Deletion failed:", err.message);
    if (err.code === 7) {
      console.error("\n🔒 Permission denied. Ensure you have a service account with Firestore write access.");
      console.error(credentialHelp());
    }
    process.exit(1);
  }
}

main();
