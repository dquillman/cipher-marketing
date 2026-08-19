#!/usr/bin/env node
// Backfills Firestore campaign/hashtagBar with a hashtag bar scan.
//
// The monthly cipher-hashtag-bar-scan task writes this document on the 1st.
// This script exists to seed the FIRST one by hand, from the scan run on
// 2026-08-18, so the dashboard panel is not empty until September.
//
// The panel (site/app.html, "Hashtag bar" on the Results tab) subscribes to
// this document live. site/data/** never deploys, so Firestore is the only
// route to the dashboard.
//
// Usage:
//   node scripts/seed-hashtag-bar.mjs
//   node scripts/seed-hashtag-bar.mjs --dry    # print the payload, write nothing

import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

const DRY = process.argv.includes("--dry");

// Every number below was read off LinkedIn in Dave's logged-in Chrome on
// 2026-08-18 across three queries. Reactions and comments are the only public
// figures LinkedIn exposes for other people's posts — there are no impressions
// or clicks here because LinkedIn does not show them.
//
// null means "LinkedIn displayed no count", which is NOT the same as zero.
const DOC = {
  scannedAt: "2026-08-18T00:00:00.000Z",
  sampleSize: 11,

  separator:
    "What separates the top from the bottom is what a reaction COSTS the reader's status. " +
    "The top posts let someone react and look accomplished — a peer's exam pass, a statement of " +
    "what a real PM is. The bottom posts (exam-change news, study guides, prep tools) make reacting " +
    "an admission of not knowing something, in a feed recruiters read. The decisive datapoint: Andrew " +
    "Ramdayal is the famous instructor and his teaching posts landed 64, 14 and 7 — his unknown " +
    "student, with no following, landed 199 by reporting her own pass and naming him.",

  posts: [
    { author: "Alece Coleman, LCSW, PMP", excerpt: "I took the pmp exam on 7/30 and passed above target in all areas", reactions: 199, comments: 30 },
    { author: "Julia Manning, PMI-ACP, PMP", excerpt: "When you hire a seasoned PM professional — three things we need", reactions: 168, comments: 23 },
    { author: "Andrew Ramdayal", excerpt: "Why people fail their PMP (video)", reactions: 64, comments: 4 },
    { author: "Yanique J.", excerpt: "A PMP can add $20,000+ to your annual salary", reactions: 56, comments: 2 },
    { author: "Andrew Ramdayal", excerpt: "PMP Score Not High Enough? (video)", reactions: 14, comments: 2 },
    { author: "S&S Coaching and Consulting", excerpt: "Can you pass the PMP exam while working full-time? + guide link", reactions: 8, comments: null },
    { author: "Bryan Campbell", excerpt: "The PMP exam changed in July — getting surprisingly little attention", reactions: 7, comments: null },
    { author: "Andrew Ramdayal", excerpt: "Team charter for the PMP exam! (video)", reactions: 7, comments: null },
    { author: "David Quillman", excerpt: "Sponsor scenario, comment-gated — our only A", reactions: 4, comments: 19, isOurs: true },
    { author: "Yulia Ziablitckaia", excerpt: "Still no confirmation for your event? Trust your PM.", reactions: 3, comments: null },
    { author: "Neal Rowland", excerpt: "Browser game explaining the PMP application change", reactions: 1, comments: null },
  ],

  // RESOLVED 2026-08-18, same day. The scan flagged ten drafts on shapes with
  // no support in the bar — five build-in-public Mondays, three magnet-drops,
  // a data-drop and a contrarian. All ten were still empty placeholders, so
  // they were re-slotted to comment-gated scenarios rather than rewritten.
  // The panel warns on a NON-EMPTY list, so this stays empty until a future
  // scan finds new offenders. The history lives in each post's planNote.
  deadDraftIds: [],

  samplingNote:
    "First scan, seeded by hand on 2026-08-18 rather than by the monthly task. " +
    "LinkedIn's content search is throttled and returned 11 posts across three queries — this is the " +
    "full reachable set, not a true top-eleven of the hashtag. Our post ranks 9th on reactions and " +
    "2nd on comments; that split is the finding. Separately observed in the feed (not from these " +
    "queries, so excluded from the ranking): a 'Renewed my PMP certification today' post at 64 " +
    "reactions / 9 comments — a second pass-announcement near the top.",

  // The control account. Markus Kopko runs the SAME worked-question format
  // Dave's drafts use — answer reveal, ECO mapping, why-the-others-are-wrong —
  // but with 28,164 followers, a PMI AI Standards Core Team credential, and an
  // audience. He is the only instrument that separates "the format is weak"
  // from "Dave has no authority", because nobody in the hashtag runs the format.
  //
  // Scraped 2026-08-18 from /in/markuskleinpmp/recent-activity/all/ (that slug
  // is Kopko — the vanity URL does not match the display name).
  // CORRECTED 2026-08-18, second pass. The first pull used a loose regex that
  // took the first age-looking token in each card, which on reshares is the
  // INNER post's age — so both the window and the best-post figures were wrong
  // (it reported 24 originals in ~7 days, best 26 reactions / 10 comments).
  // This pass reads .update-components-actor__sub-description, which is the
  // card's own timestamp, and .social-details-social-counts for the counts.
  // The conclusion did not change; it got stronger.
  control: {
    name: "Markus Kopko",
    profileUrl: "https://www.linkedin.com/in/markuskleinpmp/",
    followers: 28164,
    windowLabel: "30 days",
    originals: 10,
    reposts: 34,
    reactionsMedian: 3,
    reactionsMean: 5.0,
    reactionsBest: 18,
    commentsMedian: 2,
    commentsBest: 4,
    verdict:
      "The authority theory does not survive this. With 28,164 followers and a PMI AI Standards Core " +
      "Team credential, his own posts over 30 days run a MEDIAN of 3 reactions and 2 comments, best " +
      "18 and 4. Our single comment-gated post beat his median on reactions (4 vs 3) and beat his " +
      "BEST post on comments by nearly 5x (19 vs 4). His only large numbers come from resharing other " +
      "people's viral quote-cards — one hit 1,673 reactions and it was Daniel Hemhauser's post, not " +
      "his. Nor does the Group surface rescue him: 60 of his older originals were posted into Project " +
      "Management Excellence (PMP) and land 1-4 reactions each. So neither the format nor the follower " +
      "count is what holds us back. Teaching posts underperform for the credentialed too, and reach in " +
      "this niche is bought by resharing, not by authority.",
  },

  changedSinceLastMonth:
    "Acted on same day: the ten drafts this scan flagged were all still empty placeholders, so " +
    "they were re-slotted to comment-gated scenarios on ten distinct decision patterns and moved " +
    "from 10:30 to 19:20 MT. No morning send on this account has ever earned a comment.",
};

function summarise(d) {
  console.log(`scannedAt   ${d.scannedAt}`);
  console.log(`sampleSize  ${d.sampleSize}`);
  console.log(`posts       ${d.posts.length} (ours at rank ${d.posts.findIndex((p) => p.isOurs) + 1})`);
  console.log(`deadDrafts  ${d.deadDraftIds.length}`);
  const bad = d.posts.filter((p) => p.reactions == null);
  if (bad.length) throw new Error(`${bad.length} post(s) missing a reaction count`);
  const sorted = d.posts.every((p, i, a) => i === 0 || a[i - 1].reactions >= p.reactions);
  if (!sorted) throw new Error("posts are not ordered best-first by reactions");
  console.log("ordering    ok (descending by reactions)");
}

summarise(DOC);

if (DRY) {
  console.log("\n--- dry run, nothing written ---");
  console.log(JSON.stringify(DOC, null, 2));
  process.exit(0);
}

let db;
try {
  db = await getDb();
} catch (e) {
  console.error("Could not reach Firestore:", e.message);
  console.error(credentialHelp?.() ?? "Run scripts/check-firestore-access.mjs for credential help.");
  process.exit(1);
}

await db.collection("campaign").doc("hashtagBar").set(DOC);
console.log("\n✓ wrote campaign/hashtagBar");
console.log("  The Hashtag bar panel on the Results tab subscribes live — no deploy needed.");
