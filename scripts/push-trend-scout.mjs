#!/usr/bin/env node
// Pushes a Trend Scout scan into the Firestore document campaign/trendScout,
// which is what the dashboard's Trend Scout panel subscribes to.
//
// WHY FIRESTORE AND NOT A FILE: the panel used to fetch site/data/trend-scout.json,
// but firebase.json ignores "data/**" so nothing under site/data/ is ever
// deployed. The request fell through to the SPA rewrite, came back as app.html
// with HTTP 200, .json() threw on the HTML, and the panel rendered "No scan yet"
// permanently — for any scan, however fresh. Moving the read to Firestore also
// gives Brad and cipher-trend-scout a write path that needs no deploy step.
//
// Usage:
//   node scripts/push-trend-scout.mjs                      # push site/data/trend-scout.json
//   node scripts/push-trend-scout.mjs path/to/scan.json    # push a specific file
//   node scripts/push-trend-scout.mjs --check              # read back what is live

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SRC = join(HERE, "../site/data/trend-scout.json");

const REQUIRED = ["scanDate", "angles"];

function loadScan(path) {
  let scan;
  try {
    scan = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    console.error(`❌ Could not read ${path}: ${err.message}`);
    process.exit(1);
  }

  const missing = REQUIRED.filter((k) => !scan[k]);
  if (missing.length) {
    console.error(`❌ ${path} is missing required field(s): ${missing.join(", ")}`);
    process.exit(1);
  }
  if (!Array.isArray(scan.angles) || scan.angles.length === 0) {
    console.error(`❌ ${path} has no angles — the panel would render its empty state.`);
    process.exit(1);
  }

  scan._meta = {
    ...(scan._meta || {}),
    lastUpdatedBy: "push-trend-scout",
    lastUpdatedAt: new Date().toISOString(),
    schemaVersion: 1,
    instructions:
      "Latest Trend Scout scan. Written by cipher-trend-scout / Brad. The Today tab " +
      "subscribes to this document. Do NOT move this back to site/data/ — that path is not deployed.",
  };
  return scan;
}

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const src = args.find((a) => !a.startsWith("--")) || DEFAULT_SRC;

  let db;
  try {
    db = await getDb();
  } catch (err) {
    console.error("❌ Firestore connection failed:", err.message);
    console.error(credentialHelp());
    process.exit(1);
  }

  const ref = db.collection("campaign").doc("trendScout");

  if (check) {
    const snap = await ref.get();
    if (!snap.exists) {
      console.log("campaign/trendScout does not exist — the panel will show 'No scan yet'.");
      return;
    }
    const d = snap.data();
    const ageDays = d.scanDate
      ? Math.floor((Date.now() - new Date(d.scanDate + "T00:00:00").getTime()) / 86400000)
      : null;
    console.log(`campaign/trendScout — scanDate ${d.scanDate || "—"}` +
      (ageDays == null ? "" : ` (${ageDays} day${ageDays === 1 ? "" : "s"} old)`));
    console.log(`  exams:  ${(d.examsScanned || []).join(", ") || "—"}`);
    (d.angles || []).forEach((a) => console.log(`  #${a.rank} ${a.label}`));
    return;
  }

  const scan = loadScan(src);
  console.log(`🔗 Connected via ${db.__via}`);
  await ref.set(scan);
  console.log(`✅ Wrote campaign/trendScout from ${src}`);
  console.log(`   scanDate ${scan.scanDate} · ${scan.angles.length} angle(s)`);
  console.log("   Refresh the dashboard — the Today tab picks this up live.");
}

main().catch((err) => {
  console.error("\n❌ Failed:", err.message);
  if (err.code === 7) console.error(credentialHelp());
  process.exit(1);
});
