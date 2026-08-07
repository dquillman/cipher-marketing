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

- **Scope clarification 2026-05-27:** the lurker-audience lesson (high watch time / zero reactions) is LinkedIn-only confirmed. X analytics did not show long-tail impression growth for any of the 3 Week 1 X posts — X reach decays fast and the data doesn't support a same-channel lurker conclusion. Apply the lurker lesson when drafting LI; do NOT cross-apply to X drafts. (Evidence: 3 LI posts long-tail regraded 2026-05-27, 3 X posts unchanged.)

## LinkedIn — links & CTA

<!-- e.g. "Link in first comment outperforms link in body — LI reach-caps link-in-body posts." -->
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
