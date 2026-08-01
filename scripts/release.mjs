#!/usr/bin/env node
// Bump, verify, THEN deploy — in that order, every time.
//
// Why this exists: deploying first and bumping afterwards (or forgetting the
// bump) leaves the live version badge behind the code. The badge is the only
// way to tell what is actually on the site, so when it lies, "did my fix ship?"
// becomes unanswerable — which cost real time on 2026-08-01.
//
// Usage:
//   npm run release            # patch: 1.13.0 -> 1.13.1
//   npm run release -- minor   # 1.13.0 -> 1.14.0
//   npm run release -- major
//   npm run release -- minor --dry
//
// Steps: bump package.json -> sync every version string in site/app.html ->
// parse all inline JS -> deploy hosting. A failure at any step stops the
// release, so a broken build cannot reach production.

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const PKG = join(ROOT, "package.json");
const APP = join(ROOT, "site/app.html");

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const level = args.find((a) => ["patch", "minor", "major"].includes(a)) || "patch";

// shell:true is only for npx (a .cmd on Windows). Never for node itself —
// going through cmd.exe mangles an interpreter path containing a space.
function run(cmd, cmdArgs, useShell) {
  execFileSync(cmd, cmdArgs, { cwd: ROOT, stdio: "inherit", shell: !!useShell });
}

// ---- 1. bump ----
const pkg = JSON.parse(readFileSync(PKG, "utf8"));
const from = pkg.version;
const [maj, min, pat] = from.split(".").map(Number);
const to =
  level === "major" ? `${maj + 1}.0.0` :
  level === "minor" ? `${maj}.${min + 1}.0` :
                      `${maj}.${min}.${pat + 1}`;

console.log(`\n  version  ${from}  ->  ${to}  (${level})`);
if (dry) {
  console.log("  --dry: nothing written, nothing deployed.\n");
  process.exit(0);
}

pkg.version = to;
writeFileSync(PKG, JSON.stringify(pkg, null, 2) + "\n", "utf8");

// ---- 2. sync every version string in the deployed dashboard ----
let app = readFileSync(APP, "utf8");
const before = app;
app = app.split(`>v${from}<`).join(`>v${to}<`);       // the badge
app = app.split(`?v=${from}`).join(`?v=${to}`);        // asset cache-busters
if (app === before) {
  console.error(`\n  ERROR: no "v${from}" strings found in site/app.html.`);
  console.error(`  The badge or cache-busters use a different format — fix before releasing.\n`);
  process.exit(1);
}
writeFileSync(APP, app, "utf8");

const badge = (app.match(/class="version-bar"[^>]*>v([\d.]+)</) || [])[1];
const stale = [...app.matchAll(/\?v=([\d.]+)/g)].map((m) => m[1]).filter((v) => v !== to);
console.log(`  badge    v${badge}`);
if (stale.length) console.log(`  note     ${stale.length} asset ref(s) on other versions: ${[...new Set(stale)].join(", ")}`);

// ---- 3. verify before shipping ----
console.log("\n  checking inline JS…");
run(process.execPath, [join(HERE, "check-html-js.mjs")]);

// ---- 4. deploy ----
console.log("  deploying hosting…\n");
run("npx", ["firebase", "deploy", "--only", "hosting", "--project", "cipher-marketing-daveq", "--non-interactive"], true);

console.log(`\n  released v${to} — commit and push next:`);
console.log(`    git add -A && git commit -m "chore(release): v${to}" && git push\n`);
