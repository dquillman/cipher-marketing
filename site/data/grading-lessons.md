# Grading Lessons

Durable lessons learned from grading CipherExam marketing posts. Appended by the `post-performance-grader` subagent when it identifies a pattern confident enough to be a campaign-wide rule (not just per-post feedback). Read by the `draft-week-posts` skill as drafting constraints, so future weeks inherit what we've learned.

**How entries are added:** the grader appends one bullet at the end of the matching section. Don't manually reorganize unless consolidating duplicates.

**How entries are used:** every entry here is treated as a soft constraint or preference for new drafts. If a new lesson contradicts an older one, the newer one wins — the grader is responsible for replacing the older line, not stacking contradictions.

---

## LinkedIn — timing & format

<!-- e.g. "Tue 8:30 MT outperforms Fri 10:30 MT by ~3x impressions (3 graded posts, 2026-05). Prefer Tue/Wed for LI." -->
- Video view rate is stuck at 16-28% across all Week 1 video posts — below the 30% "good" threshold (3 graded posts, 2026-05). BUT once viewers commit, average watch time is 12-16s (likely full or near-full completion on 15-20s videos) — the failure is the thumbnail/first-1.5s not earning the scroll-stop, not the content failing to hold. Next videos must cold-open on a single concrete number or a visible "wrong-answer trap" frame, not a logo or talking head. Don't optimize the body of the video — optimize frame 0.

- **Posting recency drives distribution harder than any copy variable measured so far** (2 graded posts, 2026-08). Monday 2026-08-03 broke a 10-week silence and reached 3% out-of-network / 18.75% impressions-to-reach. Wednesday 2026-08-05, 48 hours later, hit **41% out-of-network / 40% impressions-to-reach** — near the 44% campaign best. **Link placement was held constant** (both had the URL in the body), so recency was the variable that moved. A 3%→41% out-of-network swing is the algorithm deciding to expand past the existing network. Practical rule: a gap of more than ~2 weeks appears to cost more reach than any hook rewrite can win back. Ship on cadence before optimizing copy. Caveat: n=2, and hook/copy changed alongside recency — treat as strong-but-unisolated until a third post confirms.
- **Superseded 2026-08-06:** link-in-body was previously the prime suspect for the 2026-08-03 reach collapse. The Wednesday post kept the link in the body and still tripled its expansion, so link placement is no longer the leading explanation. The link-in-comment rule below still stands as untested best practice — it has simply never actually been measured on this account. Test it in isolation, after cadence is confirmed.

## LinkedIn — copy & hook

<!-- e.g. "Numbered openers ('Process is 50% of PMP') outperform abstract openers ('Cert prep hasn't changed') by ~2x engagement rate." -->
- Workmanlike numbered domain openers ('Process is 50% of the exam') outperform clever framings on long-tail LinkedIn reach for the cert-prep audience (3 graded posts, 2026-05). Hook ranking by long-tail reach was the INVERSE of hook intuition: domain-weights (222 imps, list-of-percentages) > tool-builder (173 imps, manifesto) > exam-trap (98 imps, 'why B looks right'). Implication: LinkedIn's algorithm and the PMP/cert audience both prefer substance-dense, scannable, fact-forward openers over rhetorical or category-adversarial ones. Default Week 3+ opener pattern: lead with a specific exam stat or domain weight, not a 'most candidates / tools / programs' generalization.
- Category-adversarial openers ('Cert prep tools haven't changed since 2010', 'Every PMP prep tool tells you the right answer') correlate with a collapsed impressions→reach ratio on LinkedIn — same-feed repeat-serves instead of new-human expansion (3 graded posts, 2026-05: tool-builder 9% reach, exam-trap 18%, domain-weights 44%). Treating an established category as the antagonist appears to trigger a soft distribution penalty. Avoid framings that attack 'cert prep tools', 'flashcards', 'every prep program', etc. — reframe as candidate-pain ('PMP candidates lose half their time on Process they didn't budget for') or self-claim ('CipherExam routes adaptively to your weakest domain') instead.

- **The comment-gated scenario question is the best-performing format measured on this account, by a wide margin** (1 graded post + its follow-up, 2026-08). `li-thu-2026-08-07-sponsor-scenario` posed a four-option PMP scenario, withheld the answer, and promised the decision pattern "after the discussion": **1,220 impressions against a 238 previous best (5.1x), 90% out-of-network, and 14 comments on a feed where all seven prior LinkedIn posts recorded ZERO.** The commenters were PMP-holding senior practitioners — a clinical research manager, an implementation manager, a Scrum Master — not students.

  Two mechanics are load-bearing and must both ship together. **(1) Ask for the REASON, not just the answer.** Every substantive comment came from that instruction; the ones who only posted a letter added nothing. **(2) Actually deliver the promised follow-up, as a standalone post that restates the scenario** — the parent went 90% out-of-network, so most of the audience never saw it, and a follow-up that assumes shared context is opaque to nearly everyone it reaches.

  Honest limits: it produced **6 link clicks and 0 trials**. This is a distribution and authority play, not a conversion one — do not expect it to move signups, and do not judge it on click rate. It also exposed a rubric flaw: the flat engagement rollup scored it C (a comment counted the same as a like) until comments were weighted 3x and out-of-network was scored, which moved it to B.

  **Correction, same day — the format was NOT the only variable, and possibly not the main one.** Posting time changed at the same moment and nobody noticed, because `scheduledTimeLocal` says 10:30 MT on every post and is fiction — it records intent, not what happened. Actual send times vs impressions: `li-mon-2026-08-03-exam-change` Mon **10:30 AM** MT → 32; `li-wed-2026-08-05-experience-trap` Wed **10:30 AM** MT → 45; `li-thu-2026-08-07-sponsor-scenario` (id says Thu, it went out Friday) Fri **7:25 PM** MT → **1,220**. The two posts that went out in the scheduled morning slot are the two worst-performing posts of the month; the evening one is 27x the better of them. Format and time-of-day moved together, so neither is isolated. **Always read `postedAt`, never `scheduledTimeLocal`, when reasoning about timing.**

  A natural experiment is already running: `li-mon-2026-08-10-decision-pattern` went out **Mon 7:20 PM MT** — same evening hour, different format (a teaching post, no gate). It grades Wednesday. If it also lands well, evening timing is doing the work and the morning slot should be abandoned. If it flops, the comment-gate format is the driver. **Do not add more variables before that grades** — no new hooks, no link-placement changes.

  Unexpected return worth planning for: **the commenters produced better teaching material than the post did.** One reader's observation that distractor D "bundles a valid action (record the risk) with one that commits you (update the schedule)" is sharper than anything in the original copy, and is free content for a later post. Budget time to reply properly — matching a long, reasoned comment with a one-liner wastes the best thing this format generates.

- **RESOLVED 2026-08-12 — the pre-registered experiment above returned, and the answer is FORMAT, not timing.** `li-mon-2026-08-10-decision-pattern` went out Mon **7:20 PM MT**, the same evening hour as the comment-gate post, carrying a teaching format with no gate. It graded **D: 171 impressions, 75 members reached, 2 reactions, 1 comment, 1.75% engagement, 0 followers gained.** Against `li-thu-2026-08-07-sponsor-scenario` at **2,134 impressions / 17 comments** on the same hour of day, that is a **12.5x separation with time-of-day held constant.** Evening timing is not what carried the August 7 post. **The comment-gated scenario format is the driver.** Morning is still suspect on its own evidence (10:30 AM posts landed 32 and 45, the month's two worst), so read evening as plausibly necessary but demonstrably not sufficient — the gate is what separates.

- **Do NOT act on the grader's stock advice to "end with a direct, answerable question." It is under-specified and has already failed three times on this account.** The auto-recommendation attached to the 08-10 D grade says exactly that, and drafts that follow it literally will keep grading D. Evidence: `li-fri-2026-05-15-domains` closed on "PMPs — which domain tripped you up hardest? Process, People, or Business Environment?" → 238 impressions, **0 comments**. `li-mon-2026-05-11-launch` and `li-wed-2026-05-13-trap` likewise ended on a prompt and drew 0 comments each. A question mark is not the mechanism.

  What actually separates the 2,134-impression post from the 238-impression one is **three mechanics that must ship together**:
  1. **A decision, not a survey.** The reader judges a scenario in front of them; they do not recall their own past. "Which domain tripped you up?" asks for self-disclosure with no stake and no right answer. "A sponsor asks you to skip a stakeholder review — what do you do first?" asks them to commit to a defensible position under their real name.
  2. **Labeled options answerable in one character** (A/B/C/D). Low entry cost buys the first comments; the algorithm's early-engagement window is what needs feeding.
  3. **Withhold the answer and promise the reveal.** Commenting becomes the way to find out. Combined with mechanic 2, ask explicitly for the REASON — every substantive comment came from that instruction.

  Honest confound, now closed: all three failed question-posts carried the URL in the post body; the winner did not. Link placement co-varied with format, so this comparison is not clean. Dave locked CTA-in-first-comment for all posts on 2026-08-12, which holds that variable constant from here — the next gated post isolates format for the first time.

- **REVISES the "deliver the follow-up as a standalone post" instruction above (line ~27).** That instruction was followed exactly on 2026-08-10, and the payoff post is where the reach died: 171 impressions and 1 comment, versus 2,134 and 17 on the question it answered. Keeping the promise matters — the format burns if a promised reveal never lands — but a standalone reveal post spends a full slot to reach almost nobody. **New default: deliver the reveal inside the original thread (a substantive author comment, or an edit appending the answer below the fold), and spend the freed post slot on a fresh gated question.** n=1, so treat as a revision to test rather than settled — but it directly contradicts the older line, and per this file's own rule the newer entry wins.

- **The 48-hour grading floor is too short for this account and every grade on file is understating its post.** `li-thu-2026-08-07-sponsor-scenario` has now been measured four times and grown at every reading: **732 impressions at its 08-10 grading → 1,220 when this file was written → 2,134 on 08-12 → 2,731 at its 7-day re-measurement on 08-16.** That is **3.7x growth *after* the grade was assigned**, and the re-measurement moved its letter grade from **D to A**. Because grades feed this file and this file constrains `draft-week-posts`, understated numbers propagate into drafting rules. **Move the grading floor from 48 hours to 7 days**, and re-grade any post whose lesson depends on its absolute reach. Corollary for anyone reading a grade: a D assigned at 48h on this account is not yet evidence of a bad post.

  **7-day figures for that post (2026-08-16, supersedes every earlier reading):** 2,731 impressions, 1,802 members reached, **93% out-of-network**, 24 social engagements (4 reactions, **19 comments**, 0 reposts, 0 saves, 1 send), 3 profile viewers, 7 followers gained, 16 link clicks and **1 attributed trial signup** from GA4. Two cautions on that signup: GA4 attribution on this property is known-polluted (see the GA4 pollution notes), so one signup is a lead to verify against actual account records, **not** proof a stranger converted. And most of the growth had already landed by 08-12 (2,134 → 2,731 is +28% over four more days), so 7 days looks like roughly the right floor — not a reason to push it further out.

  **What the corpus can and cannot attribute this to (`analyze-corpus.mjs --channel linkedin`, 9 graded posts, 2026-08-16):** this post is still the ONLY one carrying labeled A–D options, asks-for-reason, withholds-answer, or the full gate — all four have shipped exactly once, together, so the script flags them **UNTESTABLE**: the corpus cannot attribute the result to any single one of them. That is an absence of evidence, not an all-clear. The next gated post should carry **some but not all** of the four so the question becomes answerable. Note also the naive split: "any question mark" shows **no** separation (171 n=7 vs 179 n=2) — a question mark is not the mechanic, the gate is.

- **Stop opening on the July 9 exam change, and stop treating a dated stat as a hook by default** (2026-08-12). Three posts in twelve days all opened on July 9: `li-mon-2026-08-03-exam-change` ("The PMP exam changed on July 9, 2026") at **32 impressions — the worst post ever measured on this account**; the 08-12 magnet post; and Friday's draft, which reused the same 8%→26% figure the August 3 post had already spent. Dave read the draft cold and said it "sounds like a post made a week ago." He was right, and literally so — it had been drafted for 08-10 and kept slipping.

  Two things to take. **(1) A dated fact decays, and the decay is invisible from inside the drafting process.** July 9 was news for maybe ten days. Any lesson that says "lead with a dated exam stat" carries an unstated expiry, and nothing in the pipeline tracks it. Before reusing a dated hook, check when it last ran and how that post performed — `analyze-corpus.mjs` prints the openers. **(2) Never open two consecutive posts on the same fact.** The magnet post and Friday's draft would have been eight days apart on the same July 9 change.

  This also **narrows the 2026-05 "workmanlike numbered opener" lesson** above. That lesson came from domain-weights (222 impressions) and is still the best evidence for substance-forward openers — but the corpus split now reads `dated-stat opener: 32 (n=1) vs 171 median (n=7)`, and the 2,134-impression best opened `PMP scenario:` with no stat and no date at all. Reconciliation that fits both: **a specific number belongs in the body as substance, not necessarily in line 1 as the hook.** For a gated question, the scenario itself is the hook — the number goes in a closing relevance line with no date attached. n is small on both sides; treat as a working rule, not settled.

- **Competitor format worth borrowing: the native LinkedIn poll + in-post reveal** (observed 2026-08-11, not yet tested on this account). A daily "PMP Question of the Day" series (Torge Oeverdiek, posting under a "PMI Prep" group name — NOT official PMI, do not describe it as such) ran a four-option question as a **native poll**: 317 votes, 2-week duration. For comparison, our comment-gate drew 14 comments. A vote is one tap; a comment is composing a defensible public answer under your real name — so polls buy volume and reach, comment-gates buy depth and the out-of-network expansion we measured. They are not substitutes.

  Two mechanics to take: **(1) the native poll** for low-friction volume, and **(2) the answer revealed behind the "…more" fold in the SAME post** rather than in a follow-up. Mechanic 2 directly removes the failure mode we hit on 2026-08-07 — a promised follow-up that came three days late and needed a whole separate post to pay off.

  **Do NOT take their question type.** "What does Earned Value represent?" is recall with one obviously-correct option, which is precisely what CipherExam positions against. The play is their format carrying our reasoning-level questions, not their format carrying their questions. Borrow structure, never wording — see the standing rule on competitor copy.

  Untested caveat: a poll cannot carry a link usefully, so the CTA still goes in the first comment. And a poll answer is visible to the author only, so it generates no public reasoning to reply to — which was the single best return from the comment-gate. Consider poll + "tell me your reason in the comments" to get both, and grade the comment count separately from the vote count.

- **The comment-gate does not survive a near-duplicate question — novelty is a load-bearing mechanic** (2026-08-17, Dave's read, and the data agrees). `li-mon-2026-08-10-bizenv-reprice` shipped the full gate (A–D options, withheld answer, ask-for-reason) and graded D at 77 impressions / 1 comment — against 2,731 / 19 for `li-thu-2026-08-07-sponsor-scenario` with the same mechanics. The difference: it was a rerun. The stem was a near-duplicate of the sponsor scenario (same "what do you do first," same option family — escalate / change request / rework / confirm-with-owner), posted ~8 days later to the same audience, AND it opened on the July 9 8%→26% Business Environment stat — the **third** run of that exact figure, already flagged one bullet up as the account's worst-performing opener. (The dated opener had actually been rewritten out on 2026-08-12, but LinkedIn published the pre-rewrite version: the native scheduler was never updated after the copy change. posts.json and LinkedIn's scheduler are separate stores — after ANY copy change to a natively-scheduled post, re-paste it into LinkedIn, then verify the live post's first line after it goes out.) So do not read this post as evidence against the gate; read it as the gate's boundary condition. **Rules: (1) each gated scenario must test a different decision pattern than any scenario posted in the prior ~4 weeks — vary the domain, the pressure source, and the correct-answer type, not just the nouns. (2) A stat that has already opened a post never opens another one.** Caveat: the dated-stat opener and the duplicate stem shipped together, so their shares of the collapse can't be separated — but both already have independent evidence against them, and neither is worth re-testing.

- **Scope clarification 2026-05-27:** the lurker-audience lesson (high watch time / zero reactions) is LinkedIn-only confirmed. X analytics did not show long-tail impression growth for any of the 3 Week 1 X posts — X reach decays fast and the data doesn't support a same-channel lurker conclusion. Apply the lurker lesson when drafting LI; do NOT cross-apply to X drafts. (Evidence: 3 LI posts long-tail regraded 2026-05-27, 3 X posts unchanged.)

## LinkedIn — links & CTA

<!-- e.g. "Link in first comment outperforms link in body — LI reach-caps link-in-body posts." -->
- **MEASURED 2026-08-12 — no post with a CTA in the body has ever received a comment. 0 for 5.** The 2026-08-06 note below says link placement "has simply never actually been measured on this account." It has now, across the whole graded corpus, and the split is clean:

  | | posts | median impressions | total comments |
  |---|---|---|---|
  | CTA in the body | 5 | 98 | **0** |
  | no CTA in the body | 3 | 171 | **7** |

  The five are `li-mon-2026-05-11-launch`, `li-wed-2026-05-13-trap`, `li-fri-2026-05-15-domains`, `li-mon-2026-08-03-exam-change`, `li-wed-2026-08-05-experience-trap` — spanning May and August, four different hooks, both morning and evening sends. Not a one-post fluke.

  **Read the two columns differently, because they are not equally strong.** The impressions gap (98 vs 171) is suggestive and no more — small n, wide spread. The comments column is the real finding, and only in one direction: **zero comments across all five body-link posts** is a claim about those five and is not confounded by anything. The reverse direction IS confounded — 6 of the 7 comments on the no-link side came from the single gated post, so "removing the link earns comments" is NOT established. What is established: a body link has never coexisted with a comment on this account.

  Dave moved the CTA to the first comment on 2026-08-12 on his own read of the feed, before this was measured. The measurement agrees with him.

  **Detector caveat, because it already caused one wrong answer:** the first version of `analyze-corpus.mjs` tested only `https?://` and therefore scored the two May posts that closed on a bare `cipherexam.com/lp/pmp?...` as having NO body link. That put 2 of the 5 in the wrong group and computed the split on the wrong sets — it reported n=3 and a weaker result. Dave caught it. **A bare domain is a link.** Any future feature detector gets checked against the actual copy of every post before its output is believed.

- Link in post body suppresses early-window LinkedIn reach but doesn't permanently cap it — long-tail distribution can recover (li-fri-domains hit 222 impressions on the same link-in-body pattern that initially capped mon-launch at 119 and wed-trap at 64; updated 2026-05). Still drop the URL from `copy` and post it as the FIRST reply comment to win the early window. Keep the `cta` field populated for the dashboard.

## X — timing & format

<!-- e.g. "Single-tweet posts outperform threads at <100 followers — algorithm-cold accounts get throttled on threads." -->
- X account is cold-start — Week 1 X posts hit 2-39 impressions despite identical-quality copy to LinkedIn (3 graded posts, 2026-05). The account has no audience to surface to. Until follower base + 10+ relevant reply-engagements per day are established, treat solo X posts as throwaway distribution. Reply-into-conversations (PMP / Sec+ / SHRM threads from accounts with reach) before publishing standalone posts.

## X — copy & hook

<!-- (empty until a pattern emerges) -->

## X — links & CTA

<!-- (empty until a pattern emerges) -->
- X URLs must include the full `https://` scheme — bare domains don't auto-link reliably (3 graded posts, 2026-05). Already enforced in `brand-voice.md`; surfaced here as a drafting reminder.

## Reddit (organic) — global rules

<!-- Things that hold across every subreddit. E.g. "Never include the CTA link in the post body — AutoMod removes it. Drop it in a top-level comment if asked." -->

## Reddit (organic) — r/pmp

<!-- Audience: PMP candidates, project managers, exam-cram crowd. Mods tolerate prep-tool mentions if value-first and signed. -->

## Reddit (organic) — r/CompTIA

<!-- Audience: Sec+/Net+/A+ candidates. Mods very strict on self-promo — value posts only, no links. -->

## Reddit (organic) — r/humanresources

<!-- Audience: HR practitioners, SHRM-CP candidates. Engagement tends to come from policy-and-edge-case threads, not exam-prep threads. -->

## Reddit (organic) — other subreddits

<!-- Add a new H2 above this one when a new subreddit gets ≥2 graded posts. -->

## Reddit Ads (paid) — creative & targeting

<!-- e.g. "Promoted posts written as native r/pmp comments outperform display-ad-style creative ~2x CTR." -->

## Reddit Ads (paid) — bidding & budget

<!-- e.g. "CPC < $0.75 only achievable on long-tail subreddit targeting; broad interests = $1.20+ CPC." -->

## Cross-channel — exam-specific

<!-- e.g. "PMP audience engages more on Tue, Sec+ on Wed (n=4 each, 2026-05)." -->

## Cross-channel — video

<!-- e.g. "1:1 video on LinkedIn outperforms 9:16 in-feed; 9:16 only when the post explicitly reads as a Reel/Short." -->
- Distribution problem is gating creative learning — across 6 Week 1 posts (4 D's on LinkedIn, 1 D / 1 C on X) zero engagement actions and zero attributed trials mean the audience never showed up, so we cannot grade copy or hook on persuasion yet. Until LinkedIn link-in-body fix and X seeding deliver baseline reach (≥500 impressions LI, ≥500 X), treat every "D" as a distribution D, not a copy D. Don't rewrite hooks chasing a copy problem we haven't actually seen evidence of.
- First counter-signal on the distribution-D rule: li-fri-domains long-tailed to 222 impressions with 0 engagement actions (regrade 2026-05-27). At reach ≥200, zero reactions/comments is starting to look like a copy or hook problem, not just a distribution problem — but n=1, watch the next 2 LI posts that clear 200 before reclassifying.
- Hook-strength does NOT predict long-tail distribution on LinkedIn — li-wed-trap (catchier "why wrong ones look right" hook) long-tailed to only 98 impressions while li-fri-domains (more workmanlike "Process is 50%" opener) reached 222 (3 graded posts, 2026-05; tool-builder Mon launch added at 173). Long-tail compounding is driven by sustained engagement signals (reactions, comments, dwell), not opener wit. Implication: don't keep iterating hooks chasing reach — fix the engagement-trigger (question-first opener, comment-bait, frame 0 of video) instead.
- Week 1 LinkedIn locked-in fact (3/3 posts, 2026-05): zero reactions, zero comments, zero reposts/saves/sends across 493 cumulative impressions; 2 total link clicks; 12-17s avg video watch on 16-36% view rates. The audience saw the posts (after long-tail), watched the videos to near-completion when they started, but took zero public engagement actions. This is a passive-audience signature, not a copy-failure signature. PMP/cert candidates on LinkedIn are lurkers, not engagers — engagement metrics will lag reach metrics for the entire campaign. Optimize for video completion + link clicks + trial signups; stop reading 0 reactions as a copy failure.
- Impressions→reach ratio on LinkedIn is a leading indicator of algorithmic framing penalties — tool-builder (category-adversarial) 9%, exam-trap (mild-adversarial) 18%, domain-weights (substance-only) 44% across 3 Week 1 LI posts (2026-05). When the ratio falls below ~15%, the algorithm is repeat-serving the same feeds instead of expanding to new humans, regardless of total impression count. Track membersReached/impressions on every LI grading and flag <15% as a framing-penalty signal, not a content problem.

- **Reshares are NOT a reach lever; comments on other people's high-performing posts are** (decision 2026-08-18, reasoned not yet measured). The control scrape of Markus Kopko (28,164 followers, PMI AI Standards Core Team) showed 34 reposts against 10 originals in 30 days, and his one card showing 1,673 reactions was **Daniel Hemhauser's post, not his** — a LinkedIn reshare card displays the ORIGINAL post's counts, so a resharer's own performance is invisible from outside. "Markus reposts a lot" is therefore not evidence that reposting works; it is equally consistent with cheap filler. **Rules: (1) do not spend a calendar slot on a reshare.** It puts someone else's content in front of our ~0 audience, banks no hook and no scenario, and by the status mechanic that explains this hashtag, resharing a stranger's win does not make our reader look good either. **(2) Commenting on high-performing posts in the niche IS worth the time** — a substantive comment on a 199-reaction post reaches the people already engaging with it, who have just self-identified as candidates at the moment they are paying attention. Reshare reaches our ~0; comment reaches their 199. This mirrors the X reply-only decision of 2026-08-07. **(3) If the reshare question is ever worth settling, it is testable on OUR account** — unlike Markus, we have analytics on our own posts — but not before the queued gated posts have run.

- **Follower count does not buy engagement in this niche — stop treating audience growth as a goal** (2026-08-18, control scrape). Markus Kopko has **28,164 followers** and a PMI credential; his own posts over 30 days run a **median of 3 reactions and 2 comments** (best 18 and 4). Our single comment-gated post (`li-thu-2026-08-07-sponsor-scenario`) beat his median on reactions (4 vs 3) and beat his **best** post on comments by nearly 5x (19 vs 4). Alece Coleman took 199 reactions with no following and no credential, by reporting her own exam pass. **Implication: the gate is a genuinely better mechanic than what the credentialed are running — do not drop it for lack of standing.** The one asset we actually lack is an OUTCOME (a user who passed, with a date and permission), not authority. **Also settled: the Group surface is not the untried lever it looked like** — 60 of Markus's originals were posted into Project Management Excellence (PMP), ~5,200 members, and land 1-4 reactions each. Do not spend a slot testing Groups.
