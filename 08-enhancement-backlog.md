# 08 — Marketing Enhancement Backlog

> Compiled by Brad on 2026-05-12. Honest prioritization based on what's actually in place today, what's been deferred, and what would materially move the needle. **Activation rate** and **attribution clarity** drive everything else, so anything that lifts those two metrics gets top priority.

**Scoring legend:**
- **Impact** — Activation-rate or attribution lift if shipped (H / M / L)
- **Effort** — Calendar time including review/test (S = <2h, M = 2-6h, L = 6h+, XL = >1 day)
- **When** — Earliest sensible ship window

---

## Tier 1 — Week 2 (May 25-31) · ship after first signals come in

These build directly on what shipped this morning, and unblock the next leg of the launch.

### 1.1 — Display approved testimonials on LPs
**Impact:** H · **Effort:** M · **When:** As soon as 3-5 approved testimonials exist (likely mid-Week 2)
The `testimonials/{uid}` collection captures rating + quote + consent, but there's no surface where they render to visitors. Adding a 3-quote testimonial strip to each Tier 1 LP probably lifts trial-start rate 10-20% based on standard social-proof benchmarks. Includes an admin moderation toggle (`status: 'pending_review' → 'approved'`).
**Why this first:** It's the rare enhancement where the data-collection side is already done; just needs a display component + admin moderation UI.

### 1.2 — Resend onboarding drip (the deferred automation)
**Impact:** H · **Effort:** L · **When:** Week 2, after 5-10 founder-email replies
Build the proper Cloud Function that fires on `users/{uid}` create and schedules emails 4-7 via Resend's `scheduled_at` API. Day 0 / Day 3 / Day 6 stay manual founder emails until activated count > 50/week. **Use the founder-email replies from Week 1 to write the actual copy** — they'll tell us what people are confused by, what they love, what made them sign up.
**Why now:** Founder emails don't scale past ~50 signups/week. Even if Week 1 only generates 10 activated users, we need this ready for Week 3-4 when we add Tier 2 certs.
**Blocker:** Needs functions/package.json + tsconfig restored on this machine. Estimate 2-3h to set up infra, 2-3h for the drip itself.

### 1.3 — Post performance grader battle-test
**Impact:** M · **Effort:** S · **When:** Tue May 19 (48h after first Monday post)
The grader subagent has never seen real metrics. First test: paste LinkedIn analytics from Monday's launch post. Iterate on grader output until Dave finds the feedback actually actionable. If it reliably surfaces 1-2 patterns from each post, it's a keeper. If not, simplify or retire.
**Why now:** Untested infrastructure has unknown failure modes. Cheap to validate, expensive to discover broken in Week 3.

### 1.4 — Mine founder-email replies for theme/tone
**Impact:** M · **Effort:** S · **When:** Rolling through Week 1-2
For every founder-email reply Dave reports, Brad tags themes (e.g., "confused about pricing", "loved the trap framing", "wished there was X"). After ~10 replies, Brad surfaces top 3 themes. These become the Week 2+ drip content AND the next round of LinkedIn post hooks.
**Why now:** The replies ARE the gold. Without theme-tagging discipline, the signal gets lost in the inbox.

---

## Tier 2 — Weeks 3-4 (June 1-12) · scale-phase work during launch

These come online once Tier 1 has proven out and the founder emails have generated a feedback corpus.

### 2.1 — Tier 2 exam LPs (CISSP, NCLEX-RN, PCEP, etc.)
**Impact:** H · **Effort:** L · **When:** Only after 25 activated users on Tier 1 (the paid-spend gate is also the audience-confidence gate)
Cipher Exam supports 11 certs. Tier 2 expansion brings in 4-5 more LPs. Pattern is established — each new LP is a copy-paste of the Tier 1 LP shell with copy swapped per `exams.ts`. Estimate 1.5h per new LP.
**Why later:** Three LPs are plenty until the first signals tell us which cluster converts best. Spreading too early dilutes attention.

### 2.2 — Reddit organic posting workflow
**Impact:** H · **Effort:** M · **When:** Week 3, after LinkedIn signal stabilizes
The cipher repo's Firestore has unused collections for Reddit (`marketing_reddit_communities`, `marketing_reddit_activity`, `marketing_reddit_drafts`) — infrastructure is half-built. Cert-prep audiences live on Reddit heavily: r/pmp, r/CompTIA, r/SHRM. Real value-first posts (NOT promotional) drive trial signups at 5-10x the LinkedIn rate for cert prep specifically.
**Why this priority:** Reddit's where PMP candidates ACTUALLY live. LinkedIn drives discovery, Reddit drives signup.

### 2.3 — Video audio pass + re-render
**Impact:** M · **Effort:** M · **When:** Week 3 (after enough budget headroom to pay for stock audio if needed)
The 20 Remotion videos have audio infrastructure wired (`AudioTrack.tsx` + `audio.ts`) but no MP3s and `AUDIO.enabled = false`. Royalty-free music (Pixabay Music / YouTube Audio Library) + the existing fade-in/out wiring takes 1-2h to add, then 30min to re-render all 20. Adding music lifts LinkedIn video completion rate ~15-20% based on platform norms.
**Why this priority:** Easy win, decent lift, but only matters if videos are getting enough impressions to justify the re-render. Hold until Week 3.

### 2.4 — A/B test hook patterns on LinkedIn
**Impact:** M · **Effort:** S · **When:** Week 4
After 9-12 graded posts (3 patterns × 3 certs × roughly weekly), real signal emerges. Pick the top-performing pattern × cert pair and fork it: same hook, two captions, post both same week 24h apart. Measure delta. This builds the muscle of "which hook works for which audience" over time.
**Why later:** Need the data to A/B against. Premature A/B before there's a baseline is noise.

---

## Tier 3 — Month 2+ (June 15 onward) · post-launch growth

Only after Week 1-4 has produced PMF signals (or hasn't, and we pivot).

### 3.1 — Paid Meta retargeting ($2/day)
**Impact:** H · **Effort:** S · **When:** After 25 activated users (the gate)
Gate is hardcoded in `campaign-state.json` for a reason: paid acquisition before product-market-fit signal burns money. After Week 1-4 generates 25-55 activated users, retargeting visitors-who-didn't-convert is the cheapest paid lever. Two ad creatives × 3 audiences = 6 ad variants, $2/day caps risk.
**Why later:** Gated by activation count. Don't relitigate.

### 3.2 — Comparison content (vs CertPreps, Kaplan, Pluralsight)
**Impact:** M · **Effort:** L · **When:** Month 2, after organic traffic is rolling
Long-form "Why CipherExam vs [competitor]" pages capture high-intent search traffic. Each page is a 1.5-2k word writeup with a fair comparison. Takes the existing `marketing:competitive-brief` skill plus 4-6h of writing/editing per page.
**Why later:** Comparison content rewards SEO patience. Worth nothing in Week 1, valuable in Month 3+.

### 3.3 — Tier 3 cert expansion + low-intent newsletter
**Impact:** M · **Effort:** L · **When:** Month 2-3
After Tier 2 LPs convert, add the remaining 3-4 certs. Also add a "Get exam tips weekly" newsletter signup on each LP for visitors who aren't ready to trial — captures email for future campaigns. Newsletter content is just repurposed Week-1 LinkedIn posts.
**Why later:** Newsletter only matters if the LP traffic is already qualified. Audit-then-add.

---

## Tier 4 — Brad / dashboard improvements (anytime, low urgency)

Quality-of-life. Don't block anything but compound over time.

### 4.1 — Brad gets Firestore read access for live signup tracking
**Impact:** L · **Effort:** M · **When:** Whenever
Today Dave reports new signups verbally during morning briefings. If Brad could query Firestore directly via the cipher repo's admin SDK, the walkthrough becomes more accurate (no manual reporting). Risk: Brad gets too autonomous; benefit: cleaner data.

### 4.2 — GA4 → campaign-state.json sync
**Impact:** L · **Effort:** L · **When:** After Month 2
Today the metrics in `campaign-state.json` are hand-entered ("you tell me a number, I update the file"). A daily Cloud Function could pull GA4 data and auto-write metrics. Not urgent because manual entry is fine at small scale, but eventually saves Dave 10 min/day.

### 4.3 — Dashboard mobile rendering polish
**Impact:** L · **Effort:** S · **When:** Whenever
The dashboard is desktop-first. On mobile, the route nav and KPI cards wrap awkwardly. Minor CSS pass would fix.

### 4.4 — Sample LinkedIn mockup → real preview generator
**Impact:** L · **Effort:** M · **When:** Anytime
The mockup at `site/sample-linkedin-post.html` is hardcoded to the Monday launch post. Could be generalized to render ANY post from `posts.json` so Dave can preview before publishing. Cute polish.

---

## Anti-backlog (things explicitly NOT to build)

- **A mobile app.** Free, paid LP and web app cover 95%. App is a Month-6+ decision tied to ARR.
- **TikTok organic.** Tier-1 audience (PMP / Sec+ / SHRM-CP) skews older, not on TikTok.
- **In-app referral program.** Marginal lift at <100 users. Premature.
- **Multi-language LPs.** Translates only after English LPs prove out.
- **Custom GA4 dashboards.** GA4 native explorer is fine. Don't reinvent.

---

## How Brad picks "what's next" during a morning briefing

1. Check `campaign-state.json` blockers and `dailyLog` for fresh signals (replies, metrics).
2. If a Tier-1 item has a precondition met (e.g., "3 approved testimonials exist"), surface it.
3. If there's no clear Tier-1 trigger, surface the highest-impact Tier-2 item with capacity (don't dump multiple).
4. If the campaign is still in launch-week panic mode, surface zero enhancement items — just blockers and posts.

This list is a living doc — update it as we learn. Re-run prioritization at the end of each campaign week.
