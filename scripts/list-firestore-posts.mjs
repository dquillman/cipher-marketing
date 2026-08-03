#!/usr/bin/env node
// Lists all posts from Firestore campaign/posts collection.
// Shows status, scheduled date, exam focus, and hook for each post.

import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

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

  try {
    const postsRef = db.collection("campaign").doc("posts");
    const doc = await postsRef.get();
    
    if (!doc.exists) {
      console.error("❌ campaign/posts document does not exist in Firestore");
      process.exit(1);
    }

    const data = doc.data();
    const posts = data.posts || [];

    console.log(`📊 Total posts in Firestore: ${posts.length}\n`);

    // Group by status
    const byStatus = {
      draft: [],
      scheduled: [],
      posted: [],
      skipped: []
    };

    posts.forEach(p => {
      const status = p.status || 'unknown';
      if (byStatus[status]) {
        byStatus[status].push(p);
      } else {
        byStatus[status] = [p];
      }
    });

    // Show drafts
    if (byStatus.draft.length > 0) {
      console.log(`📝 DRAFTS (${byStatus.draft.length}):`);
      byStatus.draft.forEach(p => {
        console.log(`  ${p.id}`);
        console.log(`    Channel: ${p.channel} | Exam: ${p.examFocus} | Hook: ${p.hook}`);
        console.log(`    Scheduled: ${p.scheduled || p.scheduledTime || 'not set'}`);
        console.log(`    Copy (first 100 chars): ${(p.copy || '').substring(0, 100)}...`);
        console.log();
      });
    }

    // Show scheduled
    if (byStatus.scheduled.length > 0) {
      console.log(`\n📅 SCHEDULED (${byStatus.scheduled.length}):`);
      byStatus.scheduled.forEach(p => {
        console.log(`  ${p.id}`);
        console.log(`    Channel: ${p.channel} | Exam: ${p.examFocus} | Hook: ${p.hook}`);
        console.log(`    Scheduled: ${p.scheduled || p.scheduledTime}`);
        console.log(`    Copy (first 100 chars): ${(p.copy || '').substring(0, 100)}...`);
        console.log();
      });
    }

    // Show posted count only
    if (byStatus.posted.length > 0) {
      console.log(`\n✅ POSTED: ${byStatus.posted.length} posts`);
    }

    // Show skipped count only
    if (byStatus.skipped.length > 0) {
      console.log(`⏭️  SKIPPED: ${byStatus.skipped.length} posts`);
    }

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`   Drafts: ${byStatus.draft.length}`);
    console.log(`   Scheduled: ${byStatus.scheduled.length}`);
    console.log(`   Posted: ${byStatus.posted.length}`);
    console.log(`   Skipped: ${byStatus.skipped.length}`);
    console.log(`   Total: ${posts.length}`);

  } catch (err) {
    console.error("\n❌ Read failed:", err.message);
    if (err.code === 7) {
      console.error("\n🔒 Permission denied. Ensure you have a service account with Firestore read access.");
      console.error(credentialHelp());
    }
    process.exit(1);
  }
}

main();
