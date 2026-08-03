#!/usr/bin/env node
// Adds 12 X (Twitter) variants of the August PMP LinkedIn posts to Firestore.
//
// Each X post mirrors the LinkedIn post's hook, exam focus, and schedule date,
// with short-form copy written for X (not a truncated LinkedIn post).
// Aug 3 and Aug 5 mirror their LinkedIn counterparts as "scheduled";
// the rest are "draft" so you control timing after seeding the X account.
//
// IDEMPOTENT: skips any X post whose id already exists in Firestore, so it is
// safe to re-run.
//
// NOTE: nothing here auto-publishes. "scheduled" just means queued in the
// dashboard — posting is still a manual action, same as your LinkedIn posts.
//
// Usage:
//   node scripts/add-x-variants.mjs

import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

const CTA = (hook) =>
  `https://cipherexam.com/lp/pmp?utm_source=x&utm_campaign=pmp_judgment_2026&utm_content=${hook}`;

const SEED_NOTE =
  "Reply into 3-5 active PMP / r/pmp-adjacent threads on X BEFORE posting this standalone — Week 1 X lesson (cold-start account needs warm signal).";

// Each entry becomes one X post document appended to campaign/posts.
const X_POSTS = [
  {
    date: "2026-08-03",
    hook: "the-exam-changed",
    status: "scheduled",
    copy:
`The PMP exam changed on July 9, 2026.

Business Environment jumped from 8% to 26%, plus AI, sustainability, and value now show up in scenarios.

More questions where several answers are reasonable — one is best.

Does your prep teach why? 7-day free trial, no card:
${CTA("the-exam-changed")}

#PMP`,
  },
  {
    date: "2026-08-05",
    hook: "experience-trap",
    status: "scheduled",
    copy:
`Experienced PMs often struggle with the PMP.

At work, speed and confidence win. The exam rewards judgment under PMI's framework — not your instincts.

CipherExam's Exam Lens shows why the best answer wins after every question.

Free 7-day trial:
${CTA("experience-trap")}

#PMP`,
  },
  {
    date: "2026-08-07",
    hook: "scenario-poll-1",
    status: "draft",
    copy:
`PMP scenario 👇

A sponsor wants to accelerate delivery by skipping a planned stakeholder review.

Do you:
A) Comply — the sponsor decides
B) Skip it but document the risk
C) Explain the risk, keep the review
D) Escalate to the PMO

Reply with your pick. Best answer explained tomorrow.

#PMP`,
  },
  {
    date: "2026-08-10",
    hook: "business-environment-26",
    status: "draft",
    copy:
`Business Environment used to be 8% of the PMP exam.

It's now 26%.

That's not a content update — it's a shift in what PMI tests: value, compliance, organizational change.

Study it like a quarter of your score depends on it. It does.
${CTA("business-environment-26")}

#PMP`,
  },
  {
    date: "2026-08-12",
    hook: "ai-is-context",
    status: "draft",
    copy:
`AI is now explicit on the PMP exam.

It won't turn you into a data scientist. It tests whether you can judge when an AI output fits the project context — and when it doesn't.

That's judgment, not tooling.

Practice it: ${CTA("ai-is-context")}

#PMP`,
  },
  {
    date: "2026-08-14",
    hook: "score-is-not-readiness",
    status: "draft",
    copy:
`A 78% practice score can hide the exact weakness that fails you on the PMP.

If you remember the question, you're testing memory — not readiness.

Exam Lens grades your reasoning, not your recall.

7 days free: ${CTA("score-is-not-readiness")}

#PMP`,
  },
  {
    date: "2026-08-17",
    hook: "stakeholder-sequence",
    status: "draft",
    copy:
`Most PMP stakeholder questions are sequence questions in disguise.

A resistant stakeholder isn't a people problem — it's a "what do you do first" problem.

Get the order wrong and the answer's wrong.

Learn the sequence: ${CTA("stakeholder-sequence")}

#PMP`,
  },
  {
    date: "2026-08-19",
    hook: "sustainability-tradeoff",
    status: "draft",
    copy:
`Sustainability on the updated PMP exam isn't trivia.

Expect tradeoffs: a cheaper option that's worse for sustainability vs a greener one that costs more.

PMI tests how you weigh them.

Practice the judgment: ${CTA("sustainability-tradeoff")}

#PMP`,
  },
  {
    date: "2026-08-21",
    hook: "scenario-poll-2",
    status: "draft",
    copy:
`PMP scenario 👇

An AI tool could shorten a critical activity, but the team hasn't assessed data privacy risk.

Do you:
A) Use it — schedule wins
B) Use it, review privacy later
C) Assess privacy first
D) Reject it outright

Reply with your pick.

#PMP`,
  },
  {
    date: "2026-08-24",
    hook: "ten-question-challenge",
    status: "draft",
    copy:
`PMP readiness test, today:

Answer 10 scenario questions. For every miss, write one sentence on why the best answer beat your pick.

Can't write it? That's your real gap.

That's exactly what Exam Lens does for you:
${CTA("ten-question-challenge")}

#PMP`,
  },
  {
    date: "2026-08-26",
    hook: "practice-quality-checklist",
    status: "draft",
    copy:
`Four checks for any PMP practice tool in 2026:

1. Aligns to the July 2026 exam outline
2. Explains why wrong answers look right
3. Adapts to your weak domains
4. Tests judgment, not recall

Miss one? You're studying for the wrong exam.
${CTA("practice-quality-checklist")}

#PMP`,
  },
  {
    date: "2026-08-28",
    hook: "founder-proof-loop",
    status: "draft",
    copy:
`The most useful signal from this campaign won't be impressions.

It'll be whether one PMP candidate passes because Exam Lens fixed how they reason.

That's the whole bet. Building in the open.

Try it: ${CTA("founder-proof-loop")}

#PMP`,
  },
];

function buildPost(x) {
  return {
    id: `x-${x.date}-${x.hook}`,
    channel: "x",
    channelAccount: "personal",
    channelHandle: "@QuillmanDavid",
    examFocus: "PMP",
    hook: x.hook,
    status: x.status,
    scheduled: x.date,
    scheduledTime: `${x.date}T17:30:00.000Z`,
    scheduledTimeLocal: `${x.date} 11:30 MT`,
    copy: x.copy,
    cta: CTA(x.hook),
    postingNote: SEED_NOTE,
    imageUrl: null,
    canvaDesignId: null,
    canvaCandidate: false,
    humanizerTellsStripped: 0,
    postedAt: null,
    postUrl: null,
    metrics: null,
    grade: null,
    gradeNotes: null,
    recommendations: null,
  };
}

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
    const existingIds = new Set(posts.map((p) => p.id));
    const originalCount = posts.length;

    console.log(`📊 Current post count in Firestore: ${originalCount}\n`);

    let added = 0;
    let skipped = 0;

    for (const x of X_POSTS) {
      const post = buildPost(x);
      if (existingIds.has(post.id)) {
        console.log(`  ⏭️  Skipping (already exists): ${post.id}`);
        skipped++;
        continue;
      }
      posts.push(post);
      console.log(`  ✓ Adding [${post.status}]: ${post.id}`);
      added++;
    }

    if (added === 0) {
      console.log("\n✅ Nothing to add — all X variants already exist.");
      process.exit(0);
    }

    await postsRef.update({ posts });

    console.log(`\n✅ Added ${added} X post(s) to Firestore (${skipped} skipped).`);
    console.log(`📊 New post count: ${posts.length} (was ${originalCount})`);
    console.log(`\nRefresh your dashboard — the X posts now appear alongside LinkedIn.`);
  } catch (err) {
    console.error("\n❌ Write failed:", err.message);
    if (err.code === 7) {
      console.error("\n🔒 Permission denied. Ensure your service account has Firestore write access.");
      console.error(credentialHelp());
    }
    process.exit(1);
  }
}

main();
