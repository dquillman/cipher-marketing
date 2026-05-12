# CipherExam — Multi-Exam Acquisition Campaign Brief

> **Folder-name note:** Directory is `cipher-exam-launch/` for legacy reasons (referenced by `launch-campaign.html` and prior handoffs). The product is **already live at v1.17** with active testers — this is **not a launch**, it is an **acquisition push**.
>
> **Built from:** verified facts in the `cipher-exam-context` skill (read 2026-05-11) — 11 live exams, per-exam Decision Lens, Full Mock specs, pricing — plus `MARKETING-PLAN.md` in the `dquillman/cipher` repo. Every assumption I can't verify is tagged `[ASSUMPTION 2026-05-11]`.
>
> **Voice mandate:** No "crush / dominate / smash." No "guaranteed pass." No invented scarcity. Pricing is fixed: Starter $0 / Pro $19/mo (yearly saves 17%) / 7-day trial / no credit card. Universal CTA: **Start Free Trial.**

---

## Section 1 — Per-Exam Analysis & Tier Recommendation

### 1.1 The change I'm proposing vs. MARKETING-PLAN.md §4.4

The plan's priority order is **PMP → CISSP → AWS → Scrum/Agile → CompTIA/ITIL ("later expansion")**.

**Two of the plan's top three exams (CISSP, AWS SAA) are not live yet** — both are flagged "coming soon" in `web/src/config/exams.ts`. So the question isn't whether the plan was right in the abstract; the question is **what to do with the 11 exams that are actually shippable today**.

**My recommendation:** Keep PMP as anchor #1 (the plan is right about that). **Promote CompTIA Security+ from "later expansion" to Tier 1.** **Add SHRM-CP as Tier 1 #3.** Demote CSM out of Tier 1 entirely.

I'll defend each pick in §1.3. First, the matrix.

### 1.2 Scoring matrix (1–5 per axis; all market-size numbers `[ASSUMPTION 2026-05-11]` unless otherwise noted)

| Exam | Annual TAM | Avg prep WTP | Search competition (lower = better) | Product wedge | Audience accessibility | Strategic adjacency | **Composite** |
|---|---|---|---|---|---|---|---|
| **PMP** | 5 | 5 | 1 (saturated — PrepCast/PMTraining/Rita) | **5** (Exam Lens + EMV math + 180Q sim) | 4 (r/pmp strict; LinkedIn strong) | 5 (→ PgMP, CSM) | **25** |
| **CompTIA Security+** | 5 | 4 | 1 (Dion/Messer/Sybex own it) | **5** (Exam Lens + **PBQ** moat) | 5 (Reddit-tolerant, hungry) | 5 (→ Net+, A+, future CISSP) | **25** |
| **SHRM-CP** | 4 | 4 | 3 (SHRM Learning System expensive; few competitors) | **5** (Competency Lens = behavioral situational judgment, perfect Bloom's-evaluate fit) | 4 (LinkedIn HR community, r/humanresources) | 3 | **23** |
| **CompTIA Network+** | 3 | 3 | 2 (Messer dominates free) | 5 (OSI Lens + PBQ) | 5 | 5 (Sec+ halo) | 23 |
| **Six Sigma GB** | 3 | 3 | 3 | 4 (Exam Lens) | 3 (fragmented across ASQ/IASSC/Council) | 3 | 19 |
| **CSM** | 4 | 2 (course usually includes assessment) | 3 | 2 (50Q exam; Scrum Guide is free; weak moat) | 4 | 4 (PMP-adjacent) | 19 |
| **CompTIA A+ Core 2** | 4 | 2 (career-switchers price-sensitive; Messer free) | 1 | 4 (Exam Lens + PBQ) | 5 | 4 | 20 |
| **ITIL 4 Foundation** | 4 | 2 (40Q, employer-bundled courses) | 3 | 3 | 4 | 3 | 19 |
| **CIA Part 1** | 2 | 4 | 4 (Gleim/Wiley dominate ~$1K) | 4 (Exam Lens) | 3 | 3 | 20 |
| **CPP** | 2 | 4 | 4 (APA/Symmetry, niche) | **5** (Exam Lens — rule-heavy, AI explanations shine) | 3 | 2 | 20 |
| **PgMP** | 1 | 5 | 5 (almost no good prep) | 5 (Exam Lens; 170Q sim is rare) | 2 (hard to reach) | 5 (PMP upsell) | 23 |

Scoring notes:
- "Search competition" is inverted — **higher = less competition = better for us**. Saturated markets like PMP / Sec+ / A+ score 1.
- "Product wedge" asks: of the 8 verified differentiators (Bloom's, metacognitive explanations, scenario-aware pipeline, original AI questions, thinking-traps, Full Mock, Readiness Report, audit pipeline), how many compound *specifically* on this exam? CompTIA family scores high because **PBQs are a feature most question-bank competitors can't deliver**.
- All TAM numbers are estimates from public certifying-body disclosures over the past few years. `[CONFIRMED 2026-05-11 by Dave — locked as working estimates for this campaign. No further pre-launch verification pass required; revisit only if a cluster underperforms its forecast.]`

### 1.3 Tier recommendation

**Tier 1 (anchor — months 1–2, paid campaign clusters running in parallel):**

1. **PMP** — *Why:* Agrees with MARKETING-PLAN.md §4.4. Largest TAM × highest WTP × strongest product wedge. PMP is the only live exam where every CipherExam differentiator (EMV math support, scenario-aware pipeline, 180-question/230-minute Full Mock, Decision Lens framework) compounds at once. The competitive market is brutal (PrepCast, PMTraining, Rita Mulcahy, PMI Authorized Training Partners) which means CAC will be high — but it's also where the buyer is most willing to evaluate a new tool mid-prep. **The wedge story:** "I keep getting 85% on practice tests but PMI questions feel different." That's literally what the Exam Lens addresses — recognizing the test-writer's framing.

2. **CompTIA Security+ (SY0-701)** — *Why I'm overriding the plan:* The plan defers Security+ to Priority 5 because it assumes CISSP and AWS are live. **They aren't.** Security+ is the closest live analog: large IT-cert TAM, hungry career-switcher audience, and **PBQs are a genuine product moat** against flashcard-only competitors (Messer's free videos, Dion's question banks, Pocket Prep). The CipherExam Full Mock for Sec+ supports MCQ + matching + PBQ natively — that combination is rare in the prep market. **The wedge story:** "I can pass every practice quiz but the PBQs on the real exam destroyed me." PBQ-native simulation is the answer, and we have it.

3. **SHRM-CP** — *Why:* This is my non-obvious pick. SHRM-CP is a behavioral / situational-judgment exam — Bloom's "evaluate" level is the dominant cognitive demand. **CipherExam's Bloom's classification is the core IP**, and the Exam Lens (`What aligns with SHRM behavioral competencies?`) maps 1:1 to how the exam grades. The competing market is dominated by SHRM's own Learning System at ~$700–$900 `[ASSUMPTION 2026-05-11]` — that's a price ceiling we can undercut convincingly at $19/mo. HR audience is reachable on LinkedIn and r/humanresources. This is the **highest "wedge-fit per CAC dollar"** opportunity in the library.

**Tier 2 (months 2–3 — expand once Tier 1 is converting):**

4. **CompTIA Network+** — Rides the Sec+ halo. Same audience cluster, same PBQ moat, lower competition for cold ads, smaller TAM. Cross-sell from Sec+ campaigns.
5. **Six Sigma Green Belt** — Exam Lens is a real wedge; fragmented certifying-body landscape means we can claim a more universal approach.
6. **CSM** — High traffic, weak conversion, but cheap to harvest. SEO + adjacent retargeting from PMP campaigns. Not a paid-ads target.

**Tier 3 (organic harvest only — months 3+):**

7. **CompTIA A+ Core 2** — Big TAM but cheap audience competing with free Messer/Meyers content. SEO only.
8. **ITIL 4 Foundation** — Pursue via a B2B angle (employer-sponsored). Not a B2C paid target.
9. **CIA Part 1** — Niche; Gleim/Wiley own paid. SEO long-tail.
10. **CPP** — Niche but strong moat (Compliance Lens). Worth one cornerstone blog targeting "{state} payroll compliance" long-tails.
11. **PgMP** — Tiny TAM, but **zero serious prep competition** + strong Decision Lens fit. Free upsell to converted PMP users — bundle, don't market.

---

## Section 2 — Campaign Architecture

Three parallel campaign clusters in Tier 1, each with its own ad group, landing page, and content stream. Shared infrastructure: one exam-agnostic cornerstone blog, one onboarding email sequence with merge-tagged exam content, one founder LinkedIn presence.

### 2.1 Cluster: PMP

- **Landing page:** `/lp/pmp-practice` `[CONFIRMED 2026-05-11 by Dave]`
- **Google Search ad groups:** "pmp practice exam," "pmp mock exam," "pmp questions explained," "pmi decision lens," "pmp emv questions"
- **Hook angle:** Exam Lens + EMV math support
- **Content stream:** founder LinkedIn worked-question posts (Exam Lens applied to one question), r/pmp value-only posts (no link)
- **Email branch:** `exam=PMP` — Day 1 weakest-domain copy references "People / Process / Business Environment" domains; Day 6 references PMI exam scheduling cycle

### 2.2 Cluster: CompTIA Security+

- **Landing page:** `/lp/security-plus-practice` `[CONFIRMED 2026-05-11 by Dave]`
- **Google Search ad groups:** "security+ practice exam," "sy0-701 pbq simulator," "security+ performance based questions," "security+ scenario questions"
- **Hook angle:** PBQ simulation + Exam Lens (CIA triad reasoning)
- **Content stream:** founder LinkedIn worked-PBQ posts, r/CompTIA + r/securityplus value-only posts
- **Email branch:** `exam=Security+` — Day 1 weakest-domain references SY0-701 domains (General Security Concepts, Threats, Security Architecture, Operations, Program Management); Day 2 emphasizes PBQ prep

### 2.3 Cluster: SHRM-CP

- **Landing page:** `/lp/shrm-cp-practice` `[CONFIRMED 2026-05-11 by Dave]`
- **Google Search ad groups:** "shrm-cp practice questions," "shrm cp scenario questions," "shrm competency questions," "shrm-cp study guide"
- **Hook angle:** Exam Lens + behavioral situational-judgment explanations
- **Content stream:** founder LinkedIn worked-question posts (Exam Lens applied), r/humanresources + r/SHRM value-only posts
- **Email branch:** `exam=SHRM-CP` — Day 1 references SHRM functional / behavioral competency clusters; Day 2 highlights how Competency Lens maps to the situational-judgment scoring rubric

### 2.4 Shared infrastructure

- **One exam-agnostic cornerstone blog** (file 01) — Dave-authored long-form explaining the Decision Lens / Bloom's framework using examples from PMP + Security+ + SHRM-CP. Drives top-of-funnel for all three clusters. References the existing `/blog/study-by-blooms-level` cornerstone.
- **One onboarding email sequence** (file 03) — merge-tagged on `{{exam_name}}` + `{{weakest_domain}}` + the per-exam Decision Lens. Same 7-day cadence per MARKETING-PLAN.md §9.2.
- **One brand-voice standard** — file 05.

---

## Section 3 — 4-Week Calendar

> **Constraint:** all three Tier 1 clusters run in parallel, but content production is staggered so we're never bottlenecked on Dave's writing time.

| Week | Mon | Tue | Wed | Thu | Fri |
|---|---|---|---|---|---|
| **1** (prep) | Publish cornerstone blog (file 01) | PMP LP live (no ads) | Sec+ LP live (no ads) | SHRM-CP LP live (no ads) | LinkedIn founder post (PMP worked question) |
| **2** | LinkedIn founder post (Sec+ PBQ walkthrough) | r/pmp value post | r/CompTIA value post | LinkedIn founder post (SHRM-CP Competency Lens) | Mid-campaign read: which channel is producing signups? |
| **3** | r/humanresources value post | X/Twitter PMP worked-question thread | X/Twitter Sec+ "the question you'll see" hook | LinkedIn warm-outreach push (exam-merge-tagged template, file 02) | LinkedIn founder post #2 PMP |
| **4** | LinkedIn founder post #2 Sec+ | LinkedIn founder post #2 SHRM-CP | X/Twitter SHRM-CP worked question | 4-week retro: which cluster activated most users? | Decision: hit paid-spend gate yet? |

### Section 3.1 — Video creative per day (Remotion)

Each content-posting day has a recommended Remotion-rendered video. Reddit value-posts and infra-only days are text-only. Today's page (`site/today.html`) shows this mapping live based on the current campaign day.

| Day | Action | Recommended creative | File |
|---|---|---|---|
| Wk1 Mon | Publish cornerstone blog | Launch teaser — PMP (12s, 1:1) | `videos/out/launch-teaser-pmp.mp4` |
| Wk1 Tue–Thu | LP go-live (PMP, Sec+, SHRM-CP) | — (infra day, no video) | — |
| Wk1 Fri | LinkedIn founder — PMP worked question | AI tutor demo — PMP scenario #1 (25s, 9:16) | `videos/out/ai-tutor-demo-pmp.mp4` |
| Wk2 Mon | LinkedIn founder — Sec+ PBQ walkthrough | **PBQ walkthrough — Sec+ (30s, 9:16)** | `videos/out/pbq-walkthrough-secplus.mp4` |
| Wk2 Tue–Wed | Reddit value posts (r/pmp, r/CompTIA) | — (text-only, no link/video) | — |
| Wk2 Thu | LinkedIn founder — SHRM-CP Competency Lens | AI tutor demo — SHRM-CP (25s, 9:16) | `videos/out/ai-tutor-demo-shrm.mp4` |
| Wk2 Fri | Mid-campaign read | — (analysis day) | — |
| Wk3 Mon | Reddit value post (r/humanresources) | — (text-only) | — |
| Wk3 Tue | X/Twitter PMP worked-question thread | AI tutor demo — PMP (re-use) | `videos/out/ai-tutor-demo-pmp.mp4` |
| Wk3 Wed | X/Twitter Sec+ hook | Launch teaser — Security+ (12s, 1:1) | `videos/out/launch-teaser-secplus.mp4` |
| Wk3 Thu | LinkedIn warm-outreach push (DMs) | — (1:1 message, no video) | — |
| Wk3 Fri | LinkedIn founder #2 — PMP variant | **AI tutor demo — PMP #2 (scope creep, 25s, 9:16)** | `videos/out/ai-tutor-demo-pmp2.mp4` |
| Wk4 Mon | LinkedIn founder #2 — Security+ | **AI tutor demo — Sec+ #2 (incident response, 25s, 9:16)** | `videos/out/ai-tutor-demo-secplus2.mp4` |
| Wk4 Tue | LinkedIn founder #2 — SHRM-CP | **AI tutor demo — SHRM-CP #2 (business acumen, 25s, 9:16)** | `videos/out/ai-tutor-demo-shrm2.mp4` |
| Wk4 Wed | X/Twitter SHRM-CP worked question | AI tutor demo — SHRM-CP (re-use) | `videos/out/ai-tutor-demo-shrm.mp4` |
| Wk4 Thu–Fri | Retro + paid-gate decision | — (analysis days) | — |

**Asset library total: 20 Remotion videos.** 9 from Round 1 (launch teaser + AI tutor demo + domain weights × PMP/Sec+/SHRM-CP), 3 Round 2 AI tutor demos with alternate scenarios, 1 PBQ walkthrough for the Sec+ CompTIA-specific differentiation, **+ 7 LinkedIn-optimised 4:5 variants** (`*-li.mp4`) of the AI tutor demos and PBQ walkthrough — these fit LinkedIn's desktop feed without letterboxing. Plus 12 still-frame PNG ad creatives in `videos/out/stills/`.

**Aspect-ratio rule of thumb:**
- **1:1** (1080×1080) → LinkedIn feed, X feed, Facebook, blog embeds
- **9:16** (1080×1920) → TikTok / Reels / Shorts / LinkedIn vertical video uploads / X mobile
- **4:5** (1080×1350) → LinkedIn desktop feed (no letterboxing). Use the `-li` variants for any LinkedIn-targeted post.

**Domain-weights videos** (`videos/out/domain-weights-{cert}.mp4`) are not slotted into a specific day — use them flexibly as supplementary creative when you want to show the "where the exam actually tests you" insight in a comment, response, or follow-up post.

**Budget anchor — organic-first per MARKETING-PLAN.md §3:**

- **Paid spend cap: $2/day total** `[CONFIRMED 2026-05-11 by Dave]`. This is the absolute ceiling until activations prove a working exam message. At $2/day, paid is symbolic for cold acquisition (PMP CPCs are $5–15) — it's only useful as **retargeting** of LP visitors who didn't sign up.
- **Hold all paid spend until the gate hits.** Gate = **25 activated users** across the three clusters (an honest organic minimum before paid amplification has signal to optimize against). Until then, $0/day.
- **Once the gate hits:** spend the $2/day on the highest-leverage retargeting channel — most likely **Reddit Promoted Posts** in the cluster's home subreddit (r/pmp, r/CompTIA, r/humanresources) or **Google Search retargeting** of LP visitors. Not cold acquisition. Not LinkedIn (minimum $10/day). Not Meta cold (won't exit learning phase).
- **Organic channels carry weeks 1–4 entirely:** founder LinkedIn posts (Dave's voice), r/pmp + r/CompTIA + r/humanresources value-only posts, LinkedIn warm DMs (max 10–15/day, per plan §3.3), and SEO from the cornerstone blog.
- **LinkedIn paid:** off. Minimum spend exceeds the cap.
- **Meta cold:** off. Can't reach learning-phase volume at this budget.

---

## Section 4 — KPIs (per exam cluster)

Primary metric per cluster: **activated users for that exam** (signup + chose THAT exam + answered 10 questions).

| Metric | PMP target (4wk) | Sec+ target (4wk) | SHRM-CP target (4wk) | Quality gate |
|---|---|---|---|---|
| Trial signups (`signup_complete`) | 30 | 15 | 10 | n/a |
| % who choose the intended exam | ≥ 70% | ≥ 70% | ≥ 70% | If < 60%, audit LP messaging |
| % activated (≥ 10 questions) | ≥ 30% | ≥ 30% | ≥ 30% | **HARD GATE — if < 30% on any cluster, fix onboarding before adding traffic** |
| `explanation_viewed` per activated user | ≥ 5 | ≥ 5 | ≥ 5 | If < 3, content positioning is wrong |
| Trial → paid (day 7) | 10% | 10% | 10% | `[CONFIRMED 2026-05-11 by Dave]` — locked as working target; recalibrate once trials accumulate to compute a real baseline. |

**Total 4-week target: 55 activated users**, split roughly **30 / 15 / 10** across PMP / Sec+ / SHRM-CP. `[Revised 2026-05-11 — original 60/30/15 split assumed paid acquisition at $45/day; downgraded to reflect $2/day cap and organic-first reality per Dave's budget constraint.]` The 100-activated-user threshold from MARKETING-PLAN.md §3 stays as the **6-month goal**.

**Paid-spend gate:** $2/day retargeting unlocks only after **25 cumulative activated users** are hit organically. Until then, $0 paid.

Reporting cadence: **weekly**, by cluster, in a single one-screen table — no slide decks.

---

## Section 5 — Scaling Addendum

**Trigger to expand to Tier 2:** any single Tier 1 cluster hits its 4-week target AND activation rate ≥ 30%.

**Trigger to kill a Tier 1 cluster:** activation rate < 30% after 4 weeks AND fixing onboarding doesn't recover it within 2 more weeks. Move budget to the winning cluster.

**Tier 2 rollout pattern:** copy the cluster template. New LP, new ad group, new Reddit sub. Reuse the onboarding email sequence (it's merge-tagged — no rewrite needed). One new founder LinkedIn worked-question post for each new cluster.

**Tier 3 rollout pattern:** SEO long-tail content only. One cornerstone blog per Tier 3 exam, no paid ads. Goal is organic indexing for "{cert} practice questions explained" tail terms — these don't compete on CAC.

**When to revisit this brief:** when CISSP or AWS SAA goes live in the product. Both were the plan's top picks and both would re-shuffle Tier 1.

---

## Section 6 — Anti-patterns to avoid (recap)

- Don't write copy that depends on a "lifetime tier" / "first 500 users" / "founding member" mechanic. None exist.
- Don't lean on the "decode/cipher" pun more than once per asset.
- Don't name competitors in paid ads (plan's "clear, not clever" rule).
- Don't write "guaranteed pass" anywhere. Ever.
- Don't generate a fifth cornerstone blog about Bloom's — three already exist on `/blog`. Reference them; don't compete with them.
- Don't lock budget on a cluster before week-1 LP CVR is in.
