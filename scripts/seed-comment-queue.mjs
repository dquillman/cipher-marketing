#!/usr/bin/env node
// Writes Firestore campaign/commentQueue — the drafted comments shown on the
// Comments page (site/app.html, data-route="comments").
//
// WHY COMMENTS AND NOT RESHARES: a reshare puts someone else's post in front of
// our ~0 followers. A comment puts us in front of the people already engaging
// with a post that is working. Recorded in grading-lessons.md 2026-08-18.
//
// TARGET SELECTION, in priority order:
//   1. Is the host post still LIVE? Reach comes from the host's current
//      activity, not its all-time counts. A 2-week-old post with 200 reactions
//      is a dead room. Everything here was <=5 days old when picked.
//   2. High reactions, LOW comments. That combination means a big audience is
//      looking and almost nobody is talking — our comment gets seen. A post
//      with 68 comments buries us.
//   3. Can a comment add something true? If we cannot say something a PMP
//      candidate would not already know, we skip it. No "great post!" filler.
//
// TIMING: comments go out in the MORNING (~07:15 MT = 09:15 ET), because a
// comment's visibility tracks the HOST post's audience, which is US-heavy and
// most active mid-morning Eastern. This is the opposite of our own posts, which
// go at 19:20 MT — that hour is tuned to OUR distribution, a different mechanic.
// Dave does not post before 07:00 MT, so 07:15 is the earliest honest slot.
//
// Usage:
//   node scripts/seed-comment-queue.mjs
//   node scripts/seed-comment-queue.mjs --dry

import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

const DRY = process.argv.includes("--dry");

const DOC = {
  preparedAt: "2026-08-18T00:00:00.000Z",

  // Captured from Dave's LinkedIn sidebar BEFORE the first comment went out.
  // The payoff from commenting is profile views and followers — people who read
  // it and came to look — not likes on the comment itself. Without a
  // before-number there is nothing to compare against, so this is the whole
  // measurement. Re-read on 2026-08-26.
  baseline: {
    capturedAt: "2026-08-19T02:12:29.721Z",
    profileViewers: 17,
    postImpressions: 1230,
  },

  items: [
    {
      when: "Today — as soon as you can",
      author: "Alece Coleman, LCSW, PMP",
      url: "https://www.linkedin.com/feed/update/urn:li:activity:7495123227401383937/",
      profile: "https://www.linkedin.com/in/acolemanpmp/",
      age: "1 day",
      postedAt: "2026-08-19T02:15:00.000Z",   // Dave posted this one on 2026-08-18 MT
      reactions: 93,
      comments: 3,
      hostSummary:
        "“STOP OVERSTUDYING FOR THE PMP.” Passed Above Target using one course, two mocks, " +
        "and ChatGPT generating 10 questions a day on her weak areas.",
      why:
        "The single best target available. 93 reactions and only 3 comments means a large, engaged " +
        "audience is looking and nobody is talking — a comment here is seen, not buried. It is one " +
        "day old, so it is still being distributed. And her method IS adaptive routing to weak areas, " +
        "which is the thing you built, so you can add something real without mentioning the product.",
      // REWRITTEN 2026-08-18 after Dave flagged the first version as aggressive.
      // He was right. This is a WIN post. The first draft explained her own
      // method back to her and then warned her the tool she used was flawed —
      // on the post celebrating that it worked. That reads as a reply-guy
      // correction, and by the same status logic that explains this hashtag, it
      // makes the READER not want to be associated with it either.
      // This version congratulates first, agrees, and aims the teaching at the
      // people who will try to copy her — not at her.
      comment:
        "Congratulations — Above Target in all areas is a serious result.\n\n" +
        "The line I would point people to is the ChatGPT one. Not because it is AI, but because of " +
        "what you did with it: ten questions a day drawn from the subjects you were actually weak in. " +
        "That is a feedback loop, and it is probably why one course was enough. Most people add more " +
        "resources when what they are missing is a signal about where to aim.\n\n" +
        "For anyone copying this — the part doing the work is reviewing what you got wrong, not the " +
        "number of questions.",
    },

    {
      when: "Thu 20 Aug, 07:15 MT",
      author: "Bryan Campbell",
      url: "https://www.linkedin.com/feed/update/urn:li:activity:7493719477059063808/",
      profile: "https://www.linkedin.com/in/bryancampbell/",
      age: "5 days",
      reactions: 7,
      comments: 0,
      hostSummary:
        "“The PMP exam changed in July” — argues the new case-study section is the underrated " +
        "change, because it alters exam-day pacing.",
      why:
        "This one is NOT for reach — 7 reactions is a small room. It is a relationship play, and it " +
        "is the highest-value one available. Campbell is a PgMP/PMP building his own PM tool (PM " +
        "Pixel) with ChatGPT and Claude, which makes him a genuine peer rather than a competitor. " +
        "Zero comments means yours is the only one he reads. Ending on a question invites a reply.",
      comment:
        "The pacing point is the one I would underline.\n\n" +
        "A case-study block front-loads reading before you can answer anything, so the per-question " +
        "clock people practise against stops matching the exam.\n\n" +
        "The other thing it changes is independence. Inside a shared scenario the questions are not " +
        "independent — misread the scenario once and you do not lose one question, you lose the " +
        "block. That is a different risk profile from a random-order exam, and it argues for reading " +
        "the exhibits properly before touching the first answer, rather than skimming and correcting " +
        "as you go.\n\n" +
        "Are you seeing candidates practise case-study blocks as a unit yet, or still drilling single " +
        "questions?",
    },
  ],

  // Stated so the next pass does not re-derive it.
  excluded:
    "Deliberately excluded: Andrew Ramdayal, despite being the largest PMP-candidate audience on " +
    "LinkedIn (65 reactions / 4 comments on an 11h-old post). Every one of his posts is VIDEO, so a " +
    "comment cannot be drafted in advance without watching it — you have to write that one live. " +
    "Also excluded: Julia Manning (168/23) and Yanique J. (56/2), both roughly two weeks old and " +
    "therefore dead rooms, and Ramdayal's live-Q&A announcement at 68 comments, where a comment is " +
    "buried on arrival.",
};

function check(d) {
  console.log(`items      ${d.items.length}`);
  for (const it of d.items) {
    if (!it.url || !/^https:\/\/www\.linkedin\.com\/feed\/update\//.test(it.url))
      throw new Error(`bad or missing post URL for ${it.author}`);
    if (!it.comment || it.comment.length < 120)
      throw new Error(`comment too short for ${it.author}`);
    if (/cipherexam|start free trial|check out my/i.test(it.comment))
      throw new Error(`comment for ${it.author} reads as a pitch — rewrite it`);
    console.log(`  ${it.when.padEnd(28)} ${it.author.padEnd(26)} ${it.reactions}r/${it.comments}c  ${it.comment.length} chars`);
  }
}

check(DOC);

if (DRY) {
  console.log("\n--- dry run, nothing written ---");
  for (const it of DOC.items) console.log("\n=== " + it.author + " ===\n" + it.comment);
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

await db.collection("campaign").doc("commentQueue").set(DOC);
console.log("\n✓ wrote campaign/commentQueue");
console.log("  Comments page subscribes live — no deploy needed for data changes.");
