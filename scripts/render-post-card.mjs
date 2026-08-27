#!/usr/bin/env node
// Renders the 1080x1350 LinkedIn feed card for a post in site/data/posts.json.
//
// Usage:
//   node scripts/render-post-card.mjs li-wed-2026-08-26-llm-compare
//   node scripts/render-post-card.mjs li-frame-test-01 --look markedUp
//   node scripts/render-post-card.mjs --all-drafts
//   node scripts/render-post-card.mjs li-frame-test-01 --write   # save imageUrl + cardLook back
//   node scripts/render-post-card.mjs li-frame-test-01 --dry-run # print props, render nothing
//
// The card copy is NOT derived from the post body — a 1,300-character LinkedIn
// post does not compress into a headline by machine. Each post carries a `card`
// object written by whoever drafts it (/draft-week-posts, /sme-post, or by hand):
//
//   "card": {
//     "look": "answerSheet",              // optional; the rule below picks one otherwise
//     "eyebrow": "PMP · COST MANAGEMENT",
//     "meta": "CIPHEREXAM",
//     "headline": "Four answers.\nAll defensible.\nOne scores.",
//     "support": "one sentence",          // ledger + markedUp
//     "statWas": "8%", "statNow": "26%", "statLabel": "…",   // ledger only
//     "options": [{ "letter": "A", "text": "…" }, …],        // answerSheet + markedUp
//     "correctIndex": 1,
//     "why": "…",                                            // answerSheet
//     "marginNotes": ["…", "…"],                             // markedUp
//     "diffRows": [{ "kind": "minus", "text": "…" }, …],      // diff
//     "comments": ["…"]                                      // diff
//   }
//
// Output: videos/out/post-cards/<postId>.png

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const VIDEOS_DIR = join(ROOT, "videos");
const POSTS_PATH = join(ROOT, "site/data/posts.json");
const OUT_DIR = join(VIDEOS_DIR, "out/post-cards");

const LOOKS = ["ledger", "answerSheet", "diff", "markedUp"];

/**
 * Four approved looks, each with a job (locked 2026-08-25):
 *   markedUp    — scenario / question posts. Shows the tutor's pen: the product itself.
 *   diff        — Security+ posts. Code-diff framing is native to that audience.
 *   ledger      — exam-change / news / milestone posts. Printed-briefing authority.
 *   answerSheet — everything else. The default; a scan form reads as "exam" instantly.
 *
 * An explicit look on the post always wins, so a collision (a Security+ scenario
 * post, say) is a human call rather than a guess by this rule.
 */
function pickLook(post) {
  const explicit = post.card?.look || post.cardLook;
  if (LOOKS.includes(explicit)) return explicit;

  const hook = (post.hook || "").toLowerCase();
  const type = (post.planPostType || "").toLowerCase();
  const exam = (post.examFocus || "").toLowerCase();

  const isQuestion =
    Boolean(post.scenarioId) ||
    hook.includes("question") ||
    hook.includes("scenario") ||
    type.includes("scenario");
  if (isQuestion) return "markedUp";

  if (exam.includes("security") || exam.includes("sec+") || exam.includes("comptia")) return "diff";

  const isNews =
    type.includes("news") ||
    type.includes("update") ||
    type.includes("milestone") ||
    hook.includes("news") ||
    hook.includes("change");
  if (isNews) return "ledger";

  return "answerSheet";
}

/** Fields each look needs before it is worth rendering. */
const REQUIRED = {
  ledger: ["headline"],
  answerSheet: ["headline", "options"],
  diff: ["headline", "diffRows"],
  markedUp: ["headline", "options", "marginNotes"],
};

function buildProps(post, lookOverride) {
  const card = post.card;
  if (!card) {
    throw new Error(
      `${post.id} has no "card" object in posts.json. Add one — see the header of this script for the shape.`
    );
  }
  const look = LOOKS.includes(lookOverride) ? lookOverride : pickLook(post);
  const missing = REQUIRED[look].filter((f) => !card[f]);
  if (missing.length) {
    throw new Error(`${post.id}: look "${look}" needs card.${missing.join(", card.")}`);
  }
  const { look: _drop, ...rest } = card;
  const props = { look, eyebrow: card.eyebrow ?? "", meta: card.meta ?? "", ...rest };

  // On a gated post the URL lives in the first comment, not the body. Saying
  // "link in this post" sends the reader hunting through copy that has no
  // link in it, and signups are the only thing this card is for.
  if (card.gated && !card.ctaSub) {
    props.ctaSub = "7-day free trial · no credit card · link in the first comment";
  }
  return props;
}

// ---- args ----
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const value = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const ids = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--look");

const dryRun = flag("--dry-run");
const writeBack = flag("--write");
const lookOverride = value("--look");
const allDrafts = flag("--all-drafts");

const doc = JSON.parse(readFileSync(POSTS_PATH, "utf8"));
const posts = Array.isArray(doc) ? doc : doc.posts;

let targets;
if (allDrafts) {
  targets = posts.filter((p) => p.channel === "linkedin" && p.status === "draft" && p.card);
} else if (ids.length) {
  targets = ids.map((id) => {
    const p = posts.find((x) => x.id === id);
    if (!p) throw new Error(`no post with id "${id}"`);
    return p;
  });
} else {
  console.error("usage: node scripts/render-post-card.mjs <postId> [--look <name>] [--write] [--dry-run]");
  console.error("       node scripts/render-post-card.mjs --all-drafts");
  process.exit(1);
}

if (!targets.length) {
  console.log("nothing to render (no LinkedIn drafts carry a card object yet)");
  process.exit(0);
}

if (!dryRun) mkdirSync(OUT_DIR, { recursive: true });

let failures = 0;
for (const post of targets) {
  let props;
  try {
    props = buildProps(post, lookOverride);
  } catch (err) {
    console.error(`skip ${post.id}: ${err.message}`);
    failures += 1;
    continue;
  }

  const outPath = join(OUT_DIR, `${post.id}.png`);
  console.log(`${post.id} → ${props.look} → ${relative(ROOT, outPath)}`);

  if (dryRun) {
    console.log(JSON.stringify(props, null, 2));
    continue;
  }

  // Remotion wants --props as a file path. Inline JSON does not survive the
  // Windows shell (dollar signs and quotes get eaten), so always write a file.
  const propsPath = join(OUT_DIR, `${post.id}.props.json`);
  writeFileSync(propsPath, JSON.stringify(props, null, 2));

  execFileSync(
    "npx",
    ["remotion", "still", "src/index.ts", "post-card", outPath, `--props=${propsPath}`],
    { cwd: VIDEOS_DIR, stdio: "inherit", shell: process.platform === "win32" }
  );

  if (writeBack) {
    post.cardLook = props.look;
    post.imageUrl = `videos/out/post-cards/${post.id}.png`;
  }
}

if (writeBack && !dryRun) {
  writeFileSync(POSTS_PATH, JSON.stringify(doc, null, 2) + "\n");
  console.log(`updated ${relative(ROOT, POSTS_PATH)} (cardLook + imageUrl)`);
  console.log("remember: node scripts/seed-firestore.mjs to push it live");
}

if (!existsSync(VIDEOS_DIR)) {
  console.error("videos/ is missing — the Remotion project is required to render");
}

process.exit(failures && !dryRun ? 1 : 0);
