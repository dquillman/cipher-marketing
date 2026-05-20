#!/usr/bin/env node
// Renders all Remotion video compositions for a named exam (or all exams).
// Wraps the per-exam render:* scripts in videos/package.json with a single CLI.
//
// Usage:
//   node scripts/render-exam.mjs pmp
//   node scripts/render-exam.mjs secplus
//   node scripts/render-exam.mjs shrm
//   node scripts/render-exam.mjs all
//   node scripts/render-exam.mjs pmp secplus     # multiple exams
//   node scripts/render-exam.mjs pmp --dry-run   # print commands without running
//
// Compositions rendered per exam:
//   launch-teaser-{exam}    → out/launch-teaser-{exam}.mp4
//   ai-tutor-demo-{exam}    → out/ai-tutor-demo-{exam}.mp4
//   domain-weights-{exam}   → out/domain-weights-{exam}.mp4
// Plus round-2 variants (pmp2, secplus2, shrm2) if requested:
//   ai-tutor-demo-{exam}2   → out/ai-tutor-demo-{exam}2.mp4

import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const VIDEOS_DIR = join(HERE, "../videos");

const EXAM_COMPOSITIONS = {
  pmp:     ["launch-teaser-pmp",     "ai-tutor-demo-pmp",     "domain-weights-pmp"],
  secplus: ["launch-teaser-secplus", "ai-tutor-demo-secplus", "domain-weights-secplus"],
  shrm:    ["launch-teaser-shrm",    "ai-tutor-demo-shrm",    "domain-weights-shrm"],
  // Round-2 alternate scenario variants
  pmp2:     ["ai-tutor-demo-pmp2"],
  secplus2: ["ai-tutor-demo-secplus2"],
  shrm2:    ["ai-tutor-demo-shrm2"],
};

const ALL_EXAMS = ["pmp", "secplus", "shrm"];
const ALL_KNOWN = Object.keys(EXAM_COMPOSITIONS);

// ---- Parse args ----
const rawArgs = process.argv.slice(2);
const dryRun = rawArgs.includes("--dry-run");
const examArgs = rawArgs.filter((a) => a !== "--dry-run");

if (examArgs.length === 0) {
  console.error("Usage: node scripts/render-exam.mjs <exam|all> [--dry-run]");
  console.error(`  Exams: ${ALL_KNOWN.join(", ")}, all`);
  process.exit(1);
}

// Expand "all"
const exams = examArgs.includes("all")
  ? ALL_EXAMS
  : examArgs.map((e) => e.toLowerCase());

// Validate
const unknown = exams.filter((e) => !EXAM_COMPOSITIONS[e]);
if (unknown.length > 0) {
  console.error(`✗  Unknown exam(s): ${unknown.join(", ")}`);
  console.error(`   Known: ${ALL_KNOWN.join(", ")}`);
  process.exit(1);
}

// ---- Build render commands ----
const jobs = [];
for (const exam of exams) {
  for (const comp of EXAM_COMPOSITIONS[exam]) {
    jobs.push({
      exam,
      comp,
      cmd: `npx remotion render src/index.ts ${comp} out/${comp}.mp4`,
    });
  }
}

const total = jobs.length;
console.log(`\nRendering ${total} composition(s) for: ${exams.join(", ")}`);
if (dryRun) console.log("(dry run — commands printed, not executed)\n");
else console.log();

// ---- Execute ----
let failed = 0;
for (let i = 0; i < jobs.length; i++) {
  const { comp, cmd } = jobs[i];
  const label = `[${i + 1}/${total}] ${comp}`;
  console.log(`  ${label}`);
  if (dryRun) {
    console.log(`    ${cmd}\n`);
    continue;
  }
  try {
    execSync(cmd, { cwd: VIDEOS_DIR, stdio: "inherit" });
    console.log(`  ✓  out/${comp}.mp4\n`);
  } catch (err) {
    console.error(`  ✗  ${comp} failed (exit ${err.status})\n`);
    failed++;
  }
}

if (!dryRun) {
  if (failed === 0) {
    console.log(`✓  All ${total} render(s) complete → videos/out/`);
  } else {
    console.error(`✗  ${failed} of ${total} render(s) failed.`);
    process.exit(1);
  }
}
