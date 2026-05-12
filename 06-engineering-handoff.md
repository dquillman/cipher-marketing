# Engineering Handoff — CipherExam Multi-Exam Campaign

**Owner:** Dave (cipherexam.com / dquillman/cipher)
**Target:** All items below shipped to production before Week 1 of the campaign starts.
**Folder reference:** All copy lives in this directory ([`marketing/cipher-exam-launch/`](.)). Engineering reads from here, marketing edits in place.

---

## 1. Stand up the three Tier 1 landing pages

Routes confirmed 2026-05-11:

| Cert | Route | Copy source |
|---|---|---|
| PMP | `/lp/pmp-practice` | [04-multi-exam-landing-pages.md](04-multi-exam-landing-pages.md) — LP #1 |
| Security+ | `/lp/security-plus-practice` | [04-multi-exam-landing-pages.md](04-multi-exam-landing-pages.md) — LP #2 |
| SHRM-CP | `/lp/shrm-cp-practice` | [04-multi-exam-landing-pages.md](04-multi-exam-landing-pages.md) — LP #3 |

**Requirements:**

- Same `#020617` dark theme as the main site, same Satoshi + General Sans font stack.
- Primary CTA on each: **"Start Free Trial"** → existing signup flow with the corresponding `examId` pre-selected (so the user lands on the right cert's diagnostic immediately — no exam-picker friction). Pre-select query param suggestion: `?exam={pmp|security-plus|shrm-cp}` resolved server-side to the Firestore exam doc ID.
- Each LP must include the **"Try a Question" widget** described in 04 §interactive — one fully-functional question from that cert's bank, full AI explanation visible after answering, no signup required to use it. This is **critical per MARKETING-PLAN.md §7.3** — pre-signup explanation experience is the highest-leverage conversion lift.
- `<head>` should include the existing site analytics stack (GA4, Meta Pixel, LinkedIn Insight, Microsoft Clarity, Google Ads conversion tag).
- Each LP needs distinct `<title>` and meta description per the copy file.

**Open question for engineering:** are the three new routes built as Vite pages in the existing `web/src/pages/` tree, or scaffolded as a separate `marketing-dashboard`-style subdomain? Default recommendation: keep them in the main React app under `web/src/pages/landing/` so the analytics tag flows through automatically.

---

## 2. Wire conversion events (per MARKETING-PLAN.md §1.1–1.3)

GA4 events needed — confirm all are firing before paid spend ever unlocks:

| Event | Trigger | Required for |
|---|---|---|
| `landing_page_view` | Any `/lp/*` page load | LP CVR tracking |
| `cta_click` | Click on "Start Free Trial" button | Funnel diagnostics |
| `trial_start` | Signup form opens | Funnel diagnostics |
| `signup_complete` | Successful signup, before exam picker | **Primary ad-platform conversion** |
| `exam_selected` | User confirms exam in onboarding | Activation step 1 |
| `activated_user` | User completes their 10th question | **Internal KPI — primary success metric** |
| `explanation_viewed` | User opens an AI explanation panel | "Is the wedge resonating?" diagnostic |

Send `signup_complete` to **Google Ads** as the imported conversion action, to **Meta** via the Conversions API (server-side, not just pixel — Meta needs server events to optimize at low volume), and to **LinkedIn Insight Tag**. `activated_user` and `explanation_viewed` stay internal in GA4.

Include `examId` as a custom dimension on `exam_selected`, `activated_user`, and `explanation_viewed` so we can split the funnel by cert cluster without re-querying Firestore. This already exists per MULTI-EXAM-PLAYBOOK.md Phase 3.

---

## 3. In-app testimonial prompt (per MARKETING-PLAN.md §3.4)

Trigger: User hits `activated_user` (10th question answered).

Prompt copy:

> **What surprised you most about CipherExam?**
>
> (One paragraph. We may quote you on the site — you'll see the exact wording before it goes live.)

Save responses to Firestore under `users/{uid}/testimonialResponses/{timestamp}`, with `examId`, `submittedAt`, and `consentToQuote: boolean` (default true, since the prompt says "you'll see the exact wording before it goes live"). Build a simple admin view in the marketing-dashboard to surface high-quality responses for landing-page lift.

This is **non-trivial for the campaign** — the brief assumes the first batch of testimonials comes from the in-app prompt, not from email outreach. If this isn't shipped by Week 2, the brief loses its primary social-proof source.

---

## 4. 7-day onboarding email sequence (Resend)

Copy in [03-onboarding-email.md](03-onboarding-email.md). Implementation requirements:

- **Days 0, 1, 2, 3, 5, 6, 7.** Day 4 intentionally skipped.
- **One CTA per email**, no fluff per plan §9.2.
- **Merge tags required:**
  - `{{exam_name}}` — display name (e.g., "PMP", "Security+", "SHRM-CP")
  - `{{exam_lens}}` — Decision Lens name from `EXAM_LENS` in `web/src/config/exams.ts` (e.g., "Exam Lens")
  - `{{weakest_domain}}` — derived from user's first-day diagnostic results (Day 1 only)
  - `{{cert_specific_deadline}}` — exam-specific Day 6 deadline framing (see file 03 Part C table)
- **Suppression rule:** any user who upgrades to Pro mid-trial gets the rest of the sequence cancelled.
- **Tracking:** UTM `utm_source=email&utm_medium=onboarding&utm_campaign=day{N}_{variant}_{exam}`. The `{exam}` tag is **new** and required for cluster-attribution.
- **Day 1 weakest-domain logic** — needs an in-app diagnostic that runs after exam selection but before the user's first practice quiz, producing a domain score that the email pulls. If the diagnostic isn't shipped, fall back to a generic "Start with Domain 1" Day 1 message (already drafted in file 03 as the fallback).

---

## 5. Reddit ad pixel (low priority — only if paid-spend gate hits)

Per the budget rules in [00-campaign-brief.md](00-campaign-brief.md) §3, the first paid dollar will most likely go to **Reddit Promoted Posts** in r/pmp / r/CompTIA / r/humanresources after the 25-activated-user gate. When that happens:

- Install Reddit's conversion pixel (similar to Meta Pixel) and wire to `signup_complete`.
- Won't be needed in weeks 1–4 since paid is off. Park this until the gate hits.

---

## 6. Pre-launch verification checklist

Before publishing the cornerstone blog (Week 1 Monday), confirm:

- [ ] All three LPs are deployed, render correctly, and the CTA works end-to-end
- [ ] "Try a Question" widget renders the right question for each cert and the explanation panel opens
- [ ] GA4 `signup_complete` fires on a real test signup and shows in DebugView
- [ ] Meta Conversions API receives a server-side test event
- [ ] LinkedIn Insight Tag is firing on `/lp/*` pages
- [ ] Resend Day 0 email sends to a test address with merge tags populated
- [ ] Resend supresses correctly when a test user upgrades mid-trial
- [ ] Testimonial prompt fires at the 10th-question milestone
- [ ] All four UTM source/medium/campaign/exam tags resolve to clean reports in GA4

If any of the above isn't done, **do not start the campaign** — paid spend is gated on real conversion tracking and the campaign brief assumes the data is flowing.

---

## 7. Owner / sequence

| Step | Owner | Estimated effort |
|---|---|---|
| 1. Three LPs (routes + copy + Try-a-Question widget) | Engineering | 1–2 days |
| 2. Conversion event wiring | Engineering | 0.5 day |
| 3. In-app testimonial prompt | Engineering | 0.5 day |
| 4. Resend 7-day sequence | Engineering / Marketing pair | 1 day |
| 5. Reddit pixel | Engineering | Park until gate hits |
| 6. Pre-launch verification | Marketing + engineering review | 0.5 day |

**Total pre-Week-1 effort: roughly 4 days** of solo-founder engineering work.

If anything in this list slips, push Week 1 — running paid without conversion tracking, or sending the onboarding sequence without merge tags, breaks the campaign's measurement foundation.
