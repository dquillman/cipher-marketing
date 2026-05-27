# Grading Lessons

Durable lessons learned from grading CipherExam marketing posts. Appended by the `post-performance-grader` subagent when it identifies a pattern confident enough to be a campaign-wide rule (not just per-post feedback). Read by the `draft-week-posts` skill as drafting constraints, so future weeks inherit what we've learned.

**How entries are added:** the grader appends one bullet at the end of the matching section. Don't manually reorganize unless consolidating duplicates.

**How entries are used:** every entry here is treated as a soft constraint or preference for new drafts. If a new lesson contradicts an older one, the newer one wins — the grader is responsible for replacing the older line, not stacking contradictions.

---

## LinkedIn — timing & format

<!-- e.g. "Tue 8:30 MT outperforms Fri 10:30 MT by ~3x impressions (3 graded posts, 2026-05). Prefer Tue/Wed for LI." -->
- Video view rate is stuck at 21-28% across all Week 1 video posts — below the 30% "good" threshold (3 graded posts, 2026-05). The first 2-3s of the video isn't stopping the scroll. Next videos must open on a single concrete number or a visible "wrong-answer trap" frame, not a logo or talking head.

## LinkedIn — copy & hook

<!-- e.g. "Numbered openers ('Process is 50% of PMP') outperform abstract openers ('Cert prep hasn't changed') by ~2x engagement rate." -->

## LinkedIn — links & CTA

<!-- e.g. "Link in first comment outperforms link in body — LI reach-caps link-in-body posts." -->
- Link in post body is suppressing reach — every Week 1 LinkedIn post with the LP URL in the body topped out at 64-119 impressions and 14-44 members reached (3 graded posts, 2026-05). Drop the URL from `copy` entirely; post it as the FIRST reply comment immediately after publishing. Keep the `cta` field populated so the dashboard still shows the destination.

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
