#!/usr/bin/env node
// Guards the promise a gated post makes on its card and in its body.
//
// Why this exists: the card renders "Answer and the full Exam Lens breakdown in
// the first comment" on every gated post, but the copy used to say the reveal
// landed "tomorrow morning" - and the comment actually posted at publish time
// was a CTA, not the answer. A reader taps the comment for the answer, finds a
// signup link, and leaves. They do not come back the next morning.
//
// Dave's call, 2026-08-28: a delayed answer loses people. One first comment,
// posted within 60 seconds, carrying the teardown AND the link.
//
// Fails if an unposted LinkedIn post either promises a reveal it has not
// written, or promises one that arrives late.
//
// Usage: node scripts/check-comment-promise.mjs

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const posts = JSON.parse(
  readFileSync(join(HERE, "../site/data/posts.json"), "utf8"),
).posts;

// Any phrasing that pushes the reveal past the moment of reading.
const DELAY = /tomorrow|next morning|in the morning|later today|later tonight|within 24 hours|by morning/i;
// Phrasing that promises the reasoning is waiting in the comments.
const PROMISE = /first comment|in the comments|in this thread/i;

const failures = [];
const stubs = [];

for (const p of posts) {
  if (p.channel !== "linkedin") continue;
  // Already live: the promise is history, editing it changes nothing for the
  // people who read it. Only unshipped copy is still fixable.
  if (p.status === "posted" || p.status === "skipped") continue;
  if (p.firstCommentPostedAt || p.ctaCommentPostedAt) continue;

  const copy = p.copy || "";
  // Placeholder stubs have no real copy yet - /sme-post writes firstComment in
  // the same pass. Note them, do not fail on them.
  if (copy.trimStart().toUpperCase().startsWith("[TO DRAFT")) { stubs.push(p.id); continue; }
  const gated = p.card?.gated === true || PROMISE.test(copy);
  if (!gated) continue;

  if (!p.firstComment) {
    failures.push(`${p.id}: promises a reveal in the comments but has no firstComment`);
  }
  for (const field of ["copy", "ctaComment", "firstComment"]) {
    const text = p[field];
    if (typeof text === "string" && DELAY.test(text)) {
      const hit = text.match(DELAY)[0];
      failures.push(`${p.id}: ${field} promises a delayed reveal ("${hit}") - the comment goes up within 60s`);
    }
  }
  if (p.ctaComment && p.firstComment) {
    failures.push(`${p.id}: has BOTH ctaComment and firstComment - one comment only, the teardown carrying the link`);
  }
}

if (failures.length) {
  console.error("x  first-comment promise check failed:\n");
  for (const f of failures) console.error("   - " + f);
  console.error(
    "\n   The card says the answer is in the first comment. Make that true:\n" +
    "   write firstComment (teardown, link last), post it within 60 seconds.\n",
  );
  process.exit(1);
}

if (stubs.length) console.log(`-  not drafted yet (firstComment still owed): ${stubs.join(", ")}`);
console.log(`ok  first-comment promise check: ${posts.filter((p) => p.channel === "linkedin").length} LinkedIn posts, no broken promises.`);
