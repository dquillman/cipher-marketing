#!/usr/bin/env node
// Diagnostic: dumps the COMPLETE field set of one August LinkedIn post and one
// August X post so we can see exactly which fields differ (esp. video-related).
//
// Usage:
//   node scripts/diff-li-vs-x.mjs

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

  const doc = await db.collection("campaign").doc("posts").get();
  const posts = (doc.data() || {}).posts || [];

  const li = posts.find((p) => p.channel === "linkedin" && String(p.id).startsWith("li-2026-08-"));
  const x = posts.find((p) => p.channel === "x" && String(p.id).startsWith("x-2026-08-"));

  console.log("=".repeat(70));
  console.log("SAMPLE LINKEDIN AUGUST POST — full JSON:");
  console.log("=".repeat(70));
  console.log(JSON.stringify(li, null, 2));

  console.log("\n" + "=".repeat(70));
  console.log("SAMPLE X AUGUST POST — full JSON:");
  console.log("=".repeat(70));
  console.log(JSON.stringify(x, null, 2));

  // Field-key comparison
  const liKeys = new Set(Object.keys(li || {}));
  const xKeys = new Set(Object.keys(x || {}));
  const onlyInLi = [...liKeys].filter((k) => !xKeys.has(k));
  const onlyInX = [...xKeys].filter((k) => !liKeys.has(k));

  console.log("\n" + "=".repeat(70));
  console.log("FIELD-KEY DIFFERENCE:");
  console.log("=".repeat(70));
  console.log("Keys present on LinkedIn post but MISSING on X post:");
  onlyInLi.forEach((k) => console.log(`  - ${k} = ${JSON.stringify(li[k])}`));
  console.log("\nKeys present on X post but not on LinkedIn post:");
  onlyInX.forEach((k) => console.log(`  - ${k} = ${JSON.stringify(x[k])}`));
}

main();
