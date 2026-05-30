# Brand Voice Check — Multi-Exam Acquisition Campaign

> **Reviewed assets:**
> - `00-campaign-brief.md`
> - `01-cornerstone-cipherexam-thinking.md`
> - `02-multi-exam-social.md`
> - `03-onboarding-email.md`
> - `04-multi-exam-landing-pages.md`
>
> **Guardrails reviewed against** (verified from `cipher-exam-context` skill, 2026-05-11):
> - Tone: direct, plain-spoken, slightly weary-of-bad-prep-tools, confident without hype
> - Reading level: 8th–10th grade
> - Approved frames: "Understand how exams think" / "Reasoning, not memorization" / "The mindset behind the questions" / "Thinking patterns, not just answers"
> - Founder voice = "I, Dave" for /story-adjacent, LinkedIn, blog. Product voice = "we" for ads, LPs, in-app, email.
> - Forbidden: "crush / dominate / smash" — "guaranteed pass" — "game-changer / revolutionary / unleash" — fake urgency / fake scarcity — named-competitor comparisons in ads
> - "Cipher/decode" wordplay: sparingly. Site uses it once total (title tag).
> - Pricing: Starter $0 / Pro $19/mo (yearly saves 17%) / 7-day trial / no credit card. Universal CTA: "Start Free Trial."
>
> **Severity scale:**
> - **BLOCK** — must fix before publishing
> - **WARN** — should fix; defensible only with founder override
> - **NOTE** — stylistic flag for awareness

---

## Per-asset findings

### 00-campaign-brief.md

| # | Severity | Finding | Action |
|---|---|---|---|
| 1 | NOTE | Brief disagrees with MARKETING-PLAN.md §4.4 (overrides Sec+ from Priority 5 to Tier 1). Disagreement is **explicit and reasoned** in §1.1 per user direction. | None. Working as required. |
| 2 | NOTE | Composite scores use 1–5 scales; "search competition" is inverted (higher = less competition = better). This is called out under the matrix to avoid reader confusion. | None. |
| 3 | PASS | No forbidden words present. No "guaranteed pass" / "crush" / "dominate" / "game-changer." | — |
| 4 | PASS | Pricing references match verbatim: "$19/month, yearly saves 17%, 7-day trial, no credit card." | — |
| 5 | PASS | Universal CTA "Start Free Trial" referenced; no variants invented. | — |

### 01-cornerstone-cipherexam-thinking.md

| # | Severity | Finding | Action |
|---|---|---|---|
| 1 | PASS | Founder voice ("I, Dave"). First-person, signed at the bottom. Matches /story tone. | — |
| 2 | PASS | References existing cornerstone blogs (`/blog/study-by-blooms-level`, `/blog/cognitive-heatmap-...`, `/blog/recall-only-prep-fails-...`) rather than competing with them. Per anti-pattern in context skill. | — |
| 3 | PASS | Uses three different Tier 1 certs (PMP, Sec+, SHRM-CP) as worked examples — fulfills user direction. | — |
| 4 | PASS | Approved frame "Understand how exams think" / "Reasoning, not memorization" both surface. "Exam stops feeling like a trick" — the canonical founder line — is used once. | — |
| 5 | NOTE | The phrase "I'll be blunt" appears once. Slightly stronger than the rest of the prose. Acceptable for founder voice (the /story page tolerates this register), but worth a flag. | Hold for Dave's pass — leave or soften. |
| 6 | PASS | Universal CTA "Start a free 7-day trial" with no card. Pricing not invented. | — |
| 7 | PASS | Reading level scan: most sentences ≤ 20 words. Specific cert names throughout. | — |

### 02-multi-exam-social.md

| # | Severity | Finding | Action |
|---|---|---|---|
| 1 | PASS | Founder voice on LinkedIn long-form, product voice on X/Twitter and Reddit. Distinction respected per guardrail. | — |
| 2 | PASS | "Cipher/decode" wordplay used **once** total — Security+ X/Twitter hook ("encoded differently / decode the CIA triad question"). Within the guardrail of "sparingly, once-per-asset-pack max." | — |
| 3 | PASS | Reddit posts contain **no links** (explicit per the brief's "value-first, no links unless invited by mods" rule). | — |
| 4 | PASS | LinkedIn warm-outreach template is decline-friendly ("read and ignore"), no pitch, no opt-in trap. | — |
| 5 | PASS | All worked-question scenarios prefaced "illustrative, not from any real exam" — protects against copyright infringement on real exam content. | — |
| 6 | NOTE | The phrase "splits the room" appears once in a Twitter post. Slightly more casual than site tone but appropriate for the channel. | None. |
| 7 | PASS | No "guaranteed pass" / "crush" / "dominate" anywhere. No invented urgency. No "first N users" hooks. | — |
| 8 | PASS | All CTAs route to `cipherexam.com` or `/pricing`. No invented landing pages claimed live. | — |

### 03-onboarding-email.md

| # | Severity | Finding | Action |
|---|---|---|---|
| 1 | PASS | Product voice ("we") throughout. No founder-voice slips. | — |
| 2 | PASS | One CTA per email, per plan §9.2. Verified across Days 0, 1, 2, 3, 5, 6, 7. | — |
| 3 | PASS | Day 4 intentionally omitted (per plan). Documented in-file. | — |
| 4 | PASS | Subject lines ≤ 50 chars where possible. The longest is "Tomorrow: you lose the 180-question PMP Full Mock" at 49 chars including punctuation. Within target. | — |
| 5 | PASS | Pricing in Day 6 + Day 7 emails is exact: "$19/month, or $189/year (save 17%)." No invented tiers. | — |
| 6 | PASS | The full EXAM_LENS table is reproduced from the context skill so the merge-tag swap is unambiguous. | — |
| 7 | PASS | Cert-specific Day 6 deadline framing table covers all 11 live exams, not just Tier 1. The sequence works for any user, not only the priority audience. | — |
| 8 | NOTE | Day 2 was reframed from the plan's "How AI explanations improve scores" to "Decision Lens for this exam." The shift is documented inline as a small-wording adjustment, not a structural change to the sequence. CTA unchanged. | If Dave wants strict plan-conformance, revert the Day 2 framing — but the lens-named version is stronger and better aligned with the verified product differentiator. |
| 9 | PASS | UTM tracking spec now includes `{exam}` tag for cluster-level attribution. New addition vs. prior version; documented in operations notes. | — |

### 04-multi-exam-landing-pages.md

| # | Severity | Finding | Action |
|---|---|---|---|
| 1 | PASS | "DRAFT — NOT FOR LIVE DEPLOYMENT" header present. Routes flagged as `[ASSUMPTION 2026-05-11]`. | — |
| 2 | PASS | Pricing block reproduces `/pricing` verbatim across all three LPs. | — |
| 3 | PASS | Universal CTA "Start Free Trial" used consistently. No variants. | — |
| 4 | PASS | "Try a Question" widgets each contain a **single AI-generated illustrative question** flagged "(Illustrative — not from any real exam.)" — protects against copyright issues. | — |
| 5 | PASS | All Full Mock specs (180Q/230min for PMP, 90Q/90min for Sec+, 134Q/220min for SHRM-CP) match the verified `exams.ts` table. | — |
| 6 | PASS | Decision Lens names and prompts match the EXAM_LENS table exactly. No paraphrasing of lens names. | — |
| 7 | NOTE | Hero H1 on Sec+ LP reads "Stop bombing Security+ PBQs." Mildly emphatic but within voice guardrail ("slightly weary-of-bad-prep-tools" is approved). | None — appropriate to channel and audience. |
| 8 | PASS | No competitor names in ad copy (Messer, Dion, PrepCast, Rita are mentioned in the brief and social posts but **not** on LP copy itself). Plan's "clear, not clever" rule for ads respected. | — |
| 9 | PASS | QA checklist included at the bottom — explicit gates before any LP goes live (route exists, tags fire, pricing matches byte-for-byte, etc.). | — |

---

## Cross-asset consistency check

| Check | Result |
|---|---|
| Universal CTA "Start Free Trial" — never "Try CipherExam," "Sign Up Free," etc. | PASS across all 5 assets |
| Pricing — Starter $0 / Pro $19/mo (yearly saves 17%) / 7-day trial / no card | PASS — identical in brief, emails, LPs |
| Decision Lens names — Exam Lens / Exam Lens / Exam Lens | PASS — identical across blog, social, emails, LPs |
| Full Mock specs — PMP 180Q/230min, Sec+ 90Q/90min, SHRM-CP 134Q/220min | PASS — identical across all assets |
| Founder vs. product voice split — Dave for long-form, "we" for emails/LPs/ads | PASS |
| "Decode/cipher" wordplay frequency — once across the campaign | PASS (Security+ X/Twitter hook only) |
| No "guaranteed pass" / "crush" / "dominate" / "revolutionary" | PASS |
| No invented urgency / scarcity / "first N users" / lifetime tier | PASS |
| Competitor names — present in brief + social value posts (Reddit-honest) but **never** in ad LP copy | PASS |
| `[ASSUMPTION YYYY-MM-DD]` tags on every unverified claim (TAM numbers, conversion targets, route paths) | PASS |

---

## Patches applied inline during review

None required. All findings are NOTE-severity or PASS. The two NOTEs that touch register ("I'll be blunt" in the cornerstone; "splits the room" in social) are within the founder-voice / channel-appropriate range. Hold for Dave's final pass before publishing the cornerstone — he may want to soften "I'll be blunt" to match the /story register more tightly.

## Open questions — all confirmed by Dave on 2026-05-11

All four items below are **`[CONFIRMED 2026-05-11 by Dave]`** and locked as working facts for this campaign.

1. ~~Route paths for the three Tier 1 LPs~~ → **Confirmed.** `/lp/pmp-practice`, `/lp/security-plus-practice`, `/lp/shrm-cp-practice` — stand these up in `web/src/`.
2. ~~Trial → paid baseline conversion rate~~ → **Confirmed at 10%** as the working target across all three clusters. Recalibrate against real activation data once enough trials accumulate to make the conversion number meaningful.
3. ~~Day 2 reframing~~ → **Confirmed.** Day 2 introduces the per-exam Decision Lens by name. The plan §9.2 literal wording is intentionally departed from; CTA unchanged.
4. ~~TAM estimates in the matrix~~ → **Confirmed as working estimates.** No further pre-launch verification pass required; revisit only if a cluster underperforms its forecast in flight.

---

## Summary

Five assets reviewed, zero BLOCK-severity findings, zero WARN-severity findings, six NOTE-severity flags (most positive — documenting deliberate-and-defensible choices). The campaign passes brand-voice review and is ready for founder pass + LP standup.

---

## Addendum — 2026-05-29 — Activation-sprint assets (`16-`, `17-`)

> **New assets reviewed** (post-launch, for the zero-distribution activation sprint):
> - `16-exam-lens-community-breakdowns.md` (10 PMP + 5 Security+ value posts, positioning, soft close)
> - `17-founder-bios.md` (LinkedIn / X / Reddit founder bios — personal-brand Distribution layer)

### 16-exam-lens-community-breakdowns.md

| # | Severity | Finding | Action |
|---|---|---|---|
| 1 | WARN → FIXED | Worked questions only carried the "original / not from any real exam" note in the file header — it would NOT travel with a copy-pasted post, unlike `02-#5`/`04-#4` which tag each question inline. | **Patched inline:** every breakdown must be posted with *"(Illustrative question — I wrote it to show the pattern, not from any real exam.)"* |
| 2 | PASS | No forbidden words ("crush/dominate/smash," "guaranteed pass," "game-changer/revolutionary/unleash"). | — |
| 3 | PASS | Approved frames lead ("how the exam thinks," "judgment not memory" = "Understand how exams think" / "Reasoning, not memorization"). | — |
| 4 | PASS | Founder voice on community surfaces (LinkedIn/X/Reddit). | — |
| 5 | PASS | Reddit close = **no link in body** (matches `02-#3`). | — |
| 6 | PASS | No invented pricing/urgency/scarcity/lifetime; no named-competitor comparisons. | — |
| 7 | PASS | "Cipher/decode" pun not used — campaign's single allowed use stays in `02-` only. | — |
| 8 | NOTE | Soft free-offer close instead of universal "Start Free Trial" CTA — correct; that CTA governs ads/LPs/in-app, community founder posts use a softer offer. | None. |

### 17-founder-bios.md

| # | Severity | Finding | Action |
|---|---|---|---|
| 1 | PASS | Founder voice ("I built CipherExam") — correct for LinkedIn/X/Reddit. | — |
| 2 | PASS | Positioning line "PMP isn't a memory test — it's a judgment test" = approved "Reasoning, not memorization" frame. | — |
| 3 | PASS | No forbidden words; "Free" used, never "guaranteed." | — |
| 4 | PASS | No pricing claims; no cipher/decode pun. | — |
| 5 | PASS | Reddit bio low-key, no link-spam — respects no-promo norm. | — |
| 6 | NOTE | Reading level ~8th–10th grade; concrete cert names. | None. |

### Addendum summary

2 assets reviewed · **0 BLOCK · 1 WARN (fixed inline) · 2 NOTE (positive).** Both pass. The lone substantive gap — the copyright disclaimer not traveling with copy-pasted posts — is patched so every posted breakdown carries the inline illustrative-question line.

### Related pricing fix (same review pass)

`07-founder-1to1-emails.md` Day-6 P.S. previously offered a non-existent **"$99 lifetime"** tier (contradicts canonical pricing). Corrected to **"$19/mo (or save 17% yearly), cancel anytime, no card."** Full `cipher-marketing/` scan confirmed this was the only stray instance (other `$99`/`lifetime` hits are competitor pricing or the guardrail rules themselves).
