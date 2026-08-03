#!/usr/bin/env node
// Updates the 12 existing X posts in Firestore to add video and videoFormat fields.
//
// Run this once after running add-x-variants.mjs to attach video files to the
// X posts that were created without them.
//
// Usage:
//   node scripts/update-x-videos.mjs

import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

const VIDEO_MAP = {
  "the-exam-changed": { file: "launch-teaser-pmp.mp4", format: "9:16" },
  "experience-trap": { file: "ai-tutor-demo-pmp.mp4", format: "9:16" },
  "scenario-poll-1": { file: "ai-tutor-demo-pmp.mp4", format: "9:16" },
  "business-environment-26": { file: "domain-weights-pmp.mp4", format: "9:16" },
  "ai-is-context": { file: "ai-tutor-demo-pmp.mp4", format: "9:16" },
  "score-is-not-readiness": { file: "ai-tutor-demo-pmp.mp4", format: "9:16" },
  "stakeholder-sequence": { file: "ai-tutor-demo-pmp.mp4", format: "9:16" },
  "sustainability-tradeoff": { file: "ai-tutor-demo-pmp.mp4", format: "9:16" },
  "scenario-poll-2": { file: "ai-tutor-demo-pmp.mp4", format: "9:16" },
  "ten-question-challenge": { file: "ai-tutor-demo-pmp.mp4", format: "9:16" },
  "practice-quality-checklist": { file: "launch-teaser-pmp.mp4", format: "9:16" },
  "founder-proof-loop": { file: "launch-teaser-pmp.mp4", format: "9:16" },
};

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

  try {
    const doc = await postsRef.get();
    if (!doc.exists) {
      console.error("❌ campaign/posts document does not exist in Firestore");
      process.exit(1);
    }

    const data = doc.data();
    const posts = data.posts || [];

    console.log(`📊 Current post count in Firestore: ${posts.length}\n`);

    let updated = 0;
    let skipped = 0;

    for (const post of posts) {
      // Only update X posts from August 2026
      if (post.channel !== "x" || !post.id.startsWith("x-2026-08-")) {
        continue;
      }

      const hook = post.hook;
      const videoInfo = VIDEO_MAP[hook];

      if (!videoInfo) {
        console.log(`  ⚠️  No video mapping for hook: ${hook} (${post.id})`);
        skipped++;
        continue;
      }

      // Check if video already set
      if (post.video && post.videoFormat) {
        console.log(`  ⏭️  Already has video: ${post.id}`);
        skipped++;
        continue;
      }

      post.video = videoInfo.file;
      post.videoFormat = videoInfo.format;
      console.log(`  ✓ Updated: ${post.id} → ${videoInfo.file} (${videoInfo.format})`);
      updated++;
    }

    if (updated === 0) {
      console.log("\n✅ Nothing to update — all X posts already have videos.");
      process.exit(0);
    }

    await postsRef.update({ posts });

    console.log(`\n✅ Updated ${updated} X post(s) with video files (${skipped} skipped).`);
    console.log(`\nRefresh your dashboard — the X posts now have videos attached.`);
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
