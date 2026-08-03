#!/usr/bin/env node
// Campaign Manager — one-click menu for all Firestore post operations.
// Keeps the credential on your local machine; bundles all the scripts into one UI.
//
// Usage:
//   node scripts/campaign-manager.mjs

import { createInterface } from "node:readline";
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

let db;
let rl;

async function connectDb() {
  if (db) return db;
  try {
    db = await getDb();
    console.log(`\n🔗 Connected to Firestore via ${db.__via}\n`);
    return db;
  } catch (err) {
    console.error("❌ Firestore connection failed:", err.message);
    console.error(credentialHelp());
    process.exit(1);
  }
}

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function listPosts() {
  console.log("\n📊 LISTING ALL POSTS\n");
  const postsRef = db.collection("campaign").doc("posts");
  const doc = await postsRef.get();
  const posts = (doc.data() || {}).posts || [];

  const byStatus = { draft: [], scheduled: [], posted: [], skipped: [] };
  posts.forEach((p) => {
    const status = p.status || "unknown";
    if (byStatus[status]) byStatus[status].push(p);
    else byStatus[status] = [p];
  });

  console.log(`Total posts: ${posts.length}\n`);

  if (byStatus.draft.length > 0) {
    console.log(`📝 DRAFTS (${byStatus.draft.length}):`);
    byStatus.draft.forEach((p) => {
      console.log(`  ${p.id}`);
      console.log(`    ${p.channel.toUpperCase()} | ${p.examFocus} | ${p.hook} | ${p.scheduled || "(no date)"}`);
    });
    console.log();
  }

  if (byStatus.scheduled.length > 0) {
    console.log(`📅 SCHEDULED (${byStatus.scheduled.length}):`);
    byStatus.scheduled.forEach((p) => {
      console.log(`  ${p.id}`);
      console.log(`    ${p.channel.toUpperCase()} | ${p.examFocus} | ${p.hook} | ${p.scheduled}`);
    });
    console.log();
  }

  if (byStatus.posted.length > 0) {
    console.log(`✅ POSTED: ${byStatus.posted.length} posts`);
  }
  if (byStatus.skipped.length > 0) {
    console.log(`⏭️  SKIPPED: ${byStatus.skipped.length} posts`);
  }
  console.log();
}

async function syncXMedia() {
  console.log("\n🔄 SYNC X MEDIA FROM LINKEDIN SIBLINGS\n");
  const postsRef = db.collection("campaign").doc("posts");
  const doc = await postsRef.get();
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

    const xMediaBefore = Object.keys(x).filter(isMediaKey);
    const liMediaKeys = Object.keys(li).filter(isMediaKey);

    for (const k of xMediaBefore) delete x[k];
    for (const k of liMediaKeys) x[k] = li[k];

    console.log(`  ✓ ${x.id}  (hook: ${x.hook})`);
    console.log(`      from LI sibling ${li.id}`);
    console.log(`      media before: ${xMediaBefore.length ? xMediaBefore.join(", ") : "(none)"}`);
    console.log(`      media after : ${liMediaKeys.length ? liMediaKeys.join(", ") : "(none — LI post is text-only)"}`);
    updated++;
  }

  if (updated === 0) {
    console.log("\n⚠️  No X posts updated.");
    return;
  }

  await postsRef.update({ posts });
  console.log(`\n✅ Synced media fields onto ${updated} X post(s) (${noSibling} had no sibling).`);

  // Verification
  console.log(`\n🔎 Verification — video fields per August X post:`);
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
  console.log();
}

async function viewPost() {
  const id = await prompt("\nEnter post ID to view (or press Enter to cancel): ");
  if (!id.trim()) return;

  const postsRef = db.collection("campaign").doc("posts");
  const doc = await postsRef.get();
  const posts = (doc.data() || {}).posts || [];
  const post = posts.find((p) => p.id === id.trim());

  if (!post) {
    console.log(`\n❌ Post not found: ${id}\n`);
    return;
  }

  console.log("\n" + "=".repeat(70));
  console.log(`POST: ${post.id}`);
  console.log("=".repeat(70));
  console.log(JSON.stringify(post, null, 2));
  console.log("=".repeat(70) + "\n");
}

async function exportPosts() {
  console.log("\n📤 EXPORT ALL POSTS TO posts-export.txt\n");
  const postsRef = db.collection("campaign").doc("posts");
  const doc = await postsRef.get();
  const posts = (doc.data() || {}).posts || [];

  const { writeFileSync } = await import("node:fs");
  const lines = [];
  posts.forEach((p) => {
    lines.push("=".repeat(70));
    lines.push(`ID: ${p.id}`);
    lines.push(`Channel: ${p.channel} | Exam: ${p.examFocus} | Hook: ${p.hook} | Status: ${p.status}`);
    lines.push(`Scheduled: ${p.scheduled || p.scheduledTime}`);
    lines.push(`CTA: ${p.cta || "(none)"}`);
    lines.push("-".repeat(70));
    lines.push(p.copy || "(no copy)");
    lines.push("");
  });

  writeFileSync("posts-export.txt", lines.join("\n"), "utf8");
  console.log(`✅ Exported ${posts.length} posts to posts-export.txt\n`);
}

async function showMenu() {
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║          CIPHER MARKETING CAMPAIGN MANAGER                    ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝");
  console.log();
  console.log("  1 › List all posts (draft/scheduled/posted breakdown)");
  console.log("  2 › Sync X media from LinkedIn siblings");
  console.log("  3 › View post details by ID");
  console.log("  4 › Export all posts to text file");
  console.log("  5 › Exit");
  console.log();

  const choice = await prompt("Choose an option (1-5): ");
  console.log();

  switch (choice.trim()) {
    case "1":
      await listPosts();
      break;
    case "2":
      await syncXMedia();
      break;
    case "3":
      await viewPost();
      break;
    case "4":
      await exportPosts();
      break;
    case "5":
      console.log("👋 Goodbye!\n");
      rl.close();
      process.exit(0);
    default:
      console.log("❌ Invalid choice. Try again.\n");
  }

  // Loop back to menu
  await showMenu();
}

async function main() {
  await connectDb();
  rl = createInterface({ input: process.stdin, output: process.stdout });
  await showMenu();
}

main();
