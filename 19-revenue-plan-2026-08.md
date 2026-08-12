# THE PLAN — First Dollars to Recurring Floor, 2026-08-07 → 2026-10-02

## Executive summary

1. **Diagnosis:** many shipped products, deep infrastructure, near-zero distribution — **$0 recorded revenue across the entire portfolio** (verified on disk 2026-08-07/08). The machine builds; nothing sells, because no human has ever been sent to a working checkout.
2. **The one chargeable asset:** CipherExam (cipherexam.com) — Stripe LIVE since 2026-08-04 with full webhook fulfillment, refund path, 60-day money-back guarantee, 12 live exams. Every other product is weeks from a settled charge.
3. **Primary first-dollar asset: the $59 one-time PMP Exam Pass (90-day access)** — charges at click, no trial delay. Decision: it leads every landing page — the current LP offer order is NOT verified on disk, so the first-72-hours checklist confirms (or fixes) the lead position on all three LPs before traffic arrives Wed 08-12. Pro $19/mo (7-day no-card trial) is the visible second option. No secondary asset, deliberately.
4. **Primary channel: LinkedIn, alone, for 30 days (08-07 → 09-05)** — 13 posts Mon/Wed/Fri 10:30 MT plus 15 min/day of comments. No sales calls, cold calls, pitches, or cold DMs, ever.
5. **Week-1 actions:** live-fire the $59 checkout with a real card and refund it; prove the Resend email runtime and GA4/Firestore attribution end to end; deploy the pending PMP cheat-sheet PDF; run `list_users.js` to count the owned audience.
6. **Week-1 continued:** first magnet-drop post ever (Wed 08-12); fix the deployed $189-annual copy and the 14-vs-7-day trial defect; deactivate Migraine Tracker's unfulfillable Payment Link.
7. **Recurring layer:** Stripe dunning toggles Mon 08-10; lead→trial cancel hook and `passExpiryEmail.ts` by Fri 08-14; deadline-shield clears its go-live checklist week 2 and launches Show HN Tue 08-25.
8. **Gates, all dated:** MT sunset gate Fri 08-21; first charged dollar targeted Fri 08-28 (1 × $59); CipherExam probation gate re-armed Fri 09-04 (≥5 activations); CipherExam 0-subscriptions rule 09-30; 12-post authority kill Mon 09-28 (post #12 publishes Fri 09-25 per the extension calendar in section 6, week 5); full board read Fri 10-02.
9. **Week-8 arithmetic (Fri 10-02):** 3 CipherExam Pro × $19 + 2 deadline-shield Solo × $29 = **$115 MRR floor**, plus 6 Exam Passes × $59 = $354 cash — **≈ $480 total charged** from a verified $0 start.
10. **Budget: $0 mandatory spend.** Scoreboard: Stripe Dashboard live mode + the board's "first 10 paying users" (N/10), read every Monday 9:00 MT — never the Admin-Core RevenueDashboard, whose hardcoded `PRICE_PER_USER = 9.99` (`src\pages\RevenueDashboard.tsx:11`) makes every number it shows wrong.

---

# 1. First-dollar asset: CipherExam's $59 PMP Exam Pass

## The pick

**Primary: CipherExam (cipherexam.com) — the $59 one-time Exam Pass, 90-day access, aimed at the PMP cluster. Secondary: none, deliberately.**

CipherExam is the only asset on this machine that can settle a card charge today. Stripe has been live since 2026-08-04 with webhook fulfillment, a refund path, and a 60-day money-back guarantee. 12 exams are live. Landing pages exist at cipherexam.com/lp/pmp, /lp/security-plus, and /lp/shrm-cp with a try-a-question widget, GA4 funnel events, and UTM persistence. 3 lead magnets are built; a 3-touch lead-magnet welcome sequence and a 7-day onboarding drip are written and deployed as functions. The entire gap between this product and a dollar is that no human has ever been sent to the checkout.

The steep-ramp arithmetic: making any other asset chargeable costs 1–6 weeks of build or waiting. Sending people to what is already chargeable costs 0 days. Pick the zero.

Why the $59 Exam Pass and not the $19/mo Pro: Pro's trial is 7 days, no card — the earliest possible Pro dollar is day 8, and only if the trialist returns and types a card number. The Exam Pass charges at click. This is the stair-step move: earn first dollars with a one-time sale on one free channel; recurring revenue is a later stair. Pro stays on the pricing page. The Exam Pass gets the traffic.

## Why no secondary

No other asset can settle a charge inside 14 days. A secondary would split the one scarce input — attention on the one locked channel — for zero week-1-or-2 payoff.

## Kill list (for now)

- **deadline-shield** — full Stripe path deployed, but the 14-day card-required trial means the earliest settled charge is ~day 15 even with a day-1 signup, and `G:\Users\daveq\deadline-shield\docs\go-live-checklist.md` is unchecked. First revival candidate — the sequence (section 6) brings it live in week 2.
- **cardledgerpro** — zero Stripe, not deployed (empty `.firebaserc`), Upgrade button goes nowhere. Weeks from chargeable.
- **Migraine Tracker** — billing cannot fulfill: bare Payment Link, no webhook, paid state never set. Fixing it is a project, not a step (dated gate in section 4).
- **Q-Photos** — the README's "flip one config flag" card payment is not in the shipped code. Verified 2026-08-07: no checkout config exists anywhere in the repo outside `README.md`, and the live `index.html` carries only the "Request availability before payment" inquiry form. Instant payment would be real build work for a site with zero traffic evidence. The inquiry-to-manual-invoice path stays as-is.
- **cronspire** — undeployed, unpriced, single-user v1. Deploying it buys a second cold-start problem, not a first dollar.
- **Everything else** (Q-IC Suite, TraderQ, MFI, projectcalm, POD-Store-Creator, 3iatlas) — no monetization surface, or excluded by the no-sales-calls / no-liability constraints.

## Day 0 — prove the pipe (~2 hours)

1. **Live-fire the checkout.** On cipherexam.com, buy the $59 PMP Exam Pass with a real personal card. Confirm in the Stripe Dashboard (dashboard.stripe.com/payments, live mode) that the charge succeeded and the `stripeWebhook` event fired. Confirm in-product: PMP unlocked, free-tier limits gone. Then refund from the Dashboard (payment row → ⋯ → Refund payment). Refunded this fast it usually processes as a reversal, which withholds no fees; worst case Stripe keeps the original processing fee — 2.9% + 30¢ = **$2.01** on $59 (verified against stripe.com/pricing and docs.stripe.com/refunds, 2026-08-07). This is the runbook verification buy already anticipated, marked for refund.
   - Contingency: if checkout fails to load, the first suspect is the stale `pk_test` publishable key in the Cipher web `.env`. Replace with the live `pk_live` key from the Stripe Dashboard (Developers → API keys), redeploy hosting, retry. If the live buy works first try, leave the stale key alone.
2. **Verify email actually sends from deployed runtime.** RESEND_API_KEY was set 2026-08-06, but whether the deployed functions have it is unproven. Test end-to-end: submit `dquillman2112+lptest@gmail.com` through the form on cipherexam.com/lp/pmp (it calls the `captureLead` callable in `G:\Users\daveq\Cipher\functions\src\captureLead.ts`). Confirm the welcome email lands within minutes and the `leadCaptures` collection gets its first-ever document. If no email arrives, the key never reached the runtime — `firebase functions:log`, then `firebase deploy --only functions` from `G:\Users\daveq\Cipher`, retest. Second confirmation after any deploy: Firestore doc `systemHealth/email` shows `ok: true` (the drip writes this) and the Resend dashboard (resend.com, Emails tab) shows the scheduled sends.
   - Safe to redeploy: the OpenAI key resolves from legacy runtime config first (`functions\src\openaiKey.ts`), so the empty `OPENAI_API_KEY` in `functions\.env` does not break the tutor or question generation on redeploy.
3. **Count the audience already owned.** Run `cd G:\Users\daveq\Cipher\functions` then `node scripts\list_users.js`. Record N = registered users and their billing status. N decides tomorrow's biggest lever.
4. **Ship the pending PMP cheat-sheet PDF update** (currently pending-deploy) in the same functions/hosting deploy.
5. **Round-trip the founder mailbox.** Every reply-able email in this plan sends from `dave@cipherexam.com` (trial rescue, section 4.2; the week-3 validation question whose replies feed the 09-04 offer-validation gate) — but FACTS verifies only Resend DKIM/SPF for *sending*; nothing on record proves inbound mail to cipherexam.com is receivable. Test now: send from dquillman2112@gmail.com to dave@cipherexam.com, confirm it lands in a readable inbox, reply from that inbox, confirm the reply arrives back in Gmail. If there is no inbound MX/mailbox, set up free email forwarding to dquillman2112@gmail.com the same day (registrar forwarding or Cloudflare Email Routing, $0). Until the round-trip passes, every "reply-able" send carries `reply_to: dquillman2112@gmail.com` — if replies bounce, the 09-04 validation count is structurally zero.

## Day 1–3 — open the only faucets that exist

**Faucet 1 — the owned list (only if N ≥ 1).** People who registered for CipherExam gave their email to this product; writing to them is not cold outreach. Write `G:\Users\daveq\Cipher\functions\scripts\send_exam_pass_note.mjs` (~40 lines): read user emails from Firestore with the same admin credentials `list_users.js` uses, POST one plain-text email each to `api.resend.com/emails` with the existing RESEND_API_KEY. Content: what the $59 Exam Pass is (one-time, 90 days, full PMP access), the 60-day money-back guarantee, one checkout link. No discount codes — none exist; do not invent infra.

**Unsubscribe mechanism for this one-off send (named, no new backend):** the email footer carries the physical postal address plus one line — "Reply, or email `dquillman2112+unsub@gmail.com` with subject UNSUBSCRIBE, and you'll never hear from me again" — sent as the message's `List-Unsubscribe: <mailto:dquillman2112+unsub@gmail.com>` header too. On any unsubscribe reply, set `emailOptOut: true` on that `users/{uid}` document (and the matching `leadCaptures` doc if one exists) from the Firebase console — a manual flag flip, honored before any later send. `send_exam_pass_note.mjs` and every subsequent broadcast script filters out `emailOptOut == true` before sending. This satisfies CAN-SPAM's working-unsubscribe requirement with zero new functions. If N = 0, skip; there is no list to mail.

**Faucet 2 — LinkedIn, the locked single channel.** The two scheduled SME posts (08-07, 08-10) go out untouched. The first-ever magnet-drop post publishes Wed 08-12 (calendar and drafting process in section 2). Known defect accepted, not fixed on day 1: a lead who later starts a trial gets both email sequences — harmless at a volume of 0 captures ever, and the cancel hook lands by 08-14 (section 4).

**Faucet 3 — the in-app wall.** After taste week, free users drop to 5 questions/day. Verify the limit screen links straight to the $59 Exam Pass checkout. If it does not, add the link — one component in the Cipher web app. This converts any future free signup with zero additional distribution work.

## First-72-hours checklist

- [ ] $59 live buy settled → webhook set paid state → refund issued (both visible at dashboard.stripe.com/payments, live mode)
- [ ] Test lead through /lp/pmp → welcome email received → `leadCaptures` count = 1
- [ ] `list_users.js` run; N recorded
- [ ] If N ≥ 1: Exam Pass note sent via Resend, unsubscribe mechanism (above) in the footer
- [ ] PMP cheat-sheet PDF update deployed
- [ ] Magnet-drop post #1 drafted and scheduled for Wed 08-12
- [ ] 08-07 and 08-10 SME posts published as scheduled
- [ ] Free-tier limit screen links to $59 checkout (added if missing)
- [ ] **LP offer order verified:** the $59 Pass leads / sits above the fold on all three LPs (/lp/pmp, /lp/security-plus, /lp/shrm-cp); if it doesn't, swap the lead position — a copy/button edit — before Wed 08-12 (this check, not the executive summary, is the source of truth for "Pass leads")
- [ ] `dave@cipherexam.com` round-trip passed (Day-0 step 5) or forwarding configured; until then all reply-able sends use `reply_to: dquillman2112@gmail.com`
- [ ] **Sat 08-08:** cipherexam.com privacy policy, ToS, and written 60-day refund policy verified live; any missing one published (Termly Free + plain pages) before the Wed 08-12 LP push — section-5 checklist item 2, now dated
- [ ] **Tue 08-11 at latest:** template + suppression audit of the ALREADY-DEPLOYED sequences (4.1 defect 4) — unsubscribe mechanism and postal-address footer in every `onboardingDrip.ts` / `leadMagnetWelcome.ts` template, `emailOptOut` check added to `scheduleOnboardingDrip` and `sendLeadMagnetWelcome`, deployed before magnet post #1 can capture a stranger
- [ ] Reddit account created in the Sat 08-08 batch (2 min) so it has 16+ days of age before warmup and ~3 weeks before the week-3 r/SideProject post
- [ ] Scoreboard = Stripe live Dashboard, checked daily. Never the Admin-Core RevenueDashboard (hardcoded $9.99 bug — see summary line 10).

## Week 1–2: what realistically produces the charge

Run the arithmetic on the only channel numbers that exist. LinkedIn all-time: 638 impressions, 3 link clicks — a 0.5% click rate. Three posts a week yield roughly 300–700 impressions, so 1–3 landing-page visits. LinkedIn alone will not produce a buyer in week 1. It stays because the 30-day single-channel commitment is locked, and its job is compounding leads through the magnet → welcome-sequence → $59 path, not instant conversion.

The week-1 charge, if it comes, comes from — in order of probability:

1. The one email to N existing registered users (warmest audience on the machine).
2. The 5/day throttle screen putting the $59 checkout in front of any free user who runs out of questions.
3. A landing-page visit converting through the 3-touch welcome sequence.

**Day-14 gate:** if by day 14 there are 0 settled charges AND 0 lead captures, the funnel is proven and the problem is proven to be traffic volume. Do not touch the product. The next move is a volume decision, not a build decision.

**Day-21 honesty:** the ops board put CipherExam on probation — 5 real PMP activations by ~07-29 or pause — and the gate was never evaluated because activation was never measured. This run, with a verified live checkout and daily Stripe-Dashboard reads, is the gate; it is formally re-armed and evaluated Fri 09-04 (section 6). 0 charges and 0 leads by day 21 means the pause conversation is real, and deadline-shield moves up.

First dollar = one settled $59 charge from someone who is not Dave. Everything above exists today except the traffic. Spend the two hours, then send the emails and the posts.

---

# 2. Distribution without Dave selling

**Product scope: CipherExam only, until another product's payment path fulfills.** Sending traffic to a broken checkout burns trust for nothing. One product, one primary channel, 30 days. (deadline-shield enters distribution in week 3, after its go-live checklist clears — section 6.)

**Starting position, in numbers (2026-08-07):** 638 lifetime LinkedIn impressions. 0 comments ever received. 0 lead captures ever. 0 trial signups from any social post. 0 paying customers. Best post ever: 238 impressions (May 22). 8 graded posts: 6 D, 2 C, zero A/B ever. These are the baseline to beat, not a launchpad.

**The spine.** Every channel points at the same funnel, which already exists: LP (/lp/pmp, /lp/security-plus, /lp/shrm-cp — try-a-question widget, GA4 funnel events, UTM persistence) → email capture (`captureLead`, live) → 3-touch welcome sequence + 7-day drip (deployed 08-06) → free Starter or 7-day Pro trial, no card → $59 Exam Pass (primary) or $19/mo Pro. Scoreboard, per the board's locked P0: **first 10 paying users.** Every number below rolls up to that one.

## Sequence at a glance

| Date | What happens | Time |
|---|---|---|
| Fri 08-07 | Day-0 proofs below; SME post #1 publishes (already scheduled) | 2–3 h |
| Sat 08-08 | Profile plumbing (30 min) + one-time directory batch + Search Console + create the Reddit account (2 min, so it ages before any Reddit post) + verify privacy/ToS/refund pages live (section-5 item 2, dated) | 4 h |
| 08-07 → 09-05 | **Primary channel: LinkedIn.** 13 posts M/W/F 10:30 MT + 15 min/day comments | ~5 h/wk |
| Wed 08-12, 10:40 MT | Live wrapper check on magnet post #1 (Proof 1, step 5) | 10 min |
| Mon 08-24 | Reddit warmup begins (account already created Sat 08-08) — rules file + comment-only, zero links | 15 min/day |
| Mon 09-07 | 30-day review against the four thresholds below | 30 min |
| Tue 09-08 | Reddit value posts begin (primary or secondary, per the review) | 1 post/wk |
| Wed 09-09 | Product Hunt launch ($0) | 2 h |
| Tue 09-15 | Show HN for CipherExam — only if the no-signup condition holds | 1 h |
| Every Mon 9:00 MT | Scoreboard ritual, 20 min (section 4 — one combined ritual) | — |

The board P0 — one distribution channel for 30 days — is locked, and three items in this table sit inside its 08-07 → 09-05 window: the 08-08 directory batch, the 08-24 Reddit warmup plus the week-3 r/SideProject launch post, and the 08-25 deadline-shield Show HN. A locked P0 does not get relitigated by definition-lawyering, so this plan does not merely reclassify them — it grants each an **explicit, on-record exemption in the section-6 gate calendar**, and the exemption ruling is written into the first Monday scoreboard row (08-10) so the board record shows it. If the 08-10 ritual rejects the ruling, the fallback is dated: the one-time directory listings stand, and the Show HN plus the r/SideProject launch post move past 09-05. (The substance behind each exemption: directories are one-time listings, not an ongoing channel; warmup is comment-only with zero links; the r/SideProject post and Show HN are a *different product's* launch, not CipherExam distribution — but the exemption, not the argument, is what makes them legal under the P0.)

## Day 0 — three proofs this plan depends on

Rule for all three: **no link-carrying post ships until Proofs 1 and 2 pass.** Authority posts (no links) may run regardless — SME #1 and #2 are already scheduled and stay scheduled.

### Proof 1 — a named trial event survives the LinkedIn path

The 30-day review counts "trial signups attributed to LinkedIn." Nothing on disk proves that number can exist: the LPs have GA4 funnel events and UTM persistence, but no trial-start event is named anywhere on record, and week-1 UTM attribution already collapsed once. Build and prove the measurement before the first link post.

1. **Name the event.** In the Cipher web repo, grep the signup/trial path for `gtag(` and `logEvent(`. If an event already fires when a trial account is created, record its exact name. If none fires, add one: `trial_start`, fired once on the trial-confirmation screen (`gtag('event','trial_start')`), deploy. The rest of this plan says `trial_start`; substitute the real name if one exists.
2. **Desktop leg — DebugView.** Install the free "Google Analytics Debugger" Chrome extension (by Google), turn it on, open `cipherexam.com/lp/pmp?utm_source=linkedin&utm_medium=social&utm_campaign=li-magnet-pmp-0812`. Walk the entire funnel: LP → try-a-question → email capture (`dquillman2112+lmtest@gmail.com`) → start trial. In GA4 → Admin → DebugView, confirm `lp_view`, the capture event, and `trial_start` each appear — and that the `trial_start` hit still carries `utm_source=linkedin`.
3. **Mobile leg — LinkedIn's in-app browser.** Send the same UTM'd URL to yourself in a LinkedIn DM on the phone, tap it so it opens inside the LinkedIn app, walk the same funnel with `dquillman2112+inapp@gmail.com`. Watch GA4 → Realtime: confirm `trial_start` ticks and the session source reads linkedin.
4. **Firestore backstop.** GA4 attribution has already collapsed once on this machine, so the review must not depend on GA4 alone. Read the `captureLead` source: if it does not already copy the persisted `utm_source` / `utm_medium` / `utm_campaign` into each `leadCaptures` document, add those three fields — the LP already persists them client-side. Do the same at account creation: write the persisted UTMs onto the new user document. After this, "which channel produced this lead/trial" is answerable from Firestore even in a week GA4 drops it.
5. **Live wrapper check, Wed 08-12 at 10:40 MT.** LinkedIn wraps posted links (lnkd.in). Within 10 minutes of magnet post #1 going live, open the post in the LinkedIn mobile app, tap its link, and confirm in GA4 Realtime that a session arrives with campaign `li-magnet-pmp-0812`. If the wrapper strips the UTMs, apply the named fix that day: add a Firebase Hosting redirect in the Cipher web `firebase.json` — `/go/li-pmp` → `/lp/pmp?utm_source=linkedin&utm_medium=social&utm_campaign=li-magnet-pmp-0812` — deploy, and edit the post's link to the clean `/go/li-pmp` path. All later magnet posts use whichever form the check proved.

Pass condition: `trial_start` observed with linkedin source on both legs, and the Firestore fields writing. Fail condition on any step: fix it that day using the fix named in the step — every fix above is under an hour of code.

### Proof 2 — email actually sends

Covered by section 1, Day 0, step 2 — the Proof-1 desktop walk submits the same test lead; welcome email #1 must arrive within 5 minutes.

### Proof 3 — the PMP PDF ships

The PMP cheat-sheet update is pending-deploy and magnet post #1 (Wed 08-12) links to it. Deploy by Tue 08-11 (section 1 puts it in the Day-0 deploy).

**Accepted defect, on the record:** a lead who also starts a trial currently gets both email sequences. Tolerable below 10 leads/week; the cancel hook lands by 08-14 (section 4) — it is a compliance task, not polish (section 5).

**Do not trust:** the campaign-state funnel block (~10 weeks stale) and the collapsed week-1 UTM attribution. Read numbers only from GA4 and the Firestore `leadCaptures` documents, with fresh campaign values in the format `li-magnet-pmp-0812`.

## Channel 1 — LinkedIn, the primary (08-07 → 09-05)

Account: Dave's personal profile. Tool: LinkedIn's built-in scheduler — the clock icon next to the Post button; free; schedules 10 minutes to 3 months ahead (LinkedIn Help). Slot: 10:30 MT Mon/Wed/Fri, the existing cadence. Native scheduler only — LinkedIn bans automation tools, and a banned account is a dead channel (section 5).

**The 30-day calendar — 13 posts, three types** (this table is canonical; where the week-by-week sequence differs, these dates govern):

| Date | Type | Asset |
|---|---|---|
| Fri 08-07 | Authority | SME post #1 (already scheduled) |
| Mon 08-10 | Authority | SME post #2 (already scheduled) |
| Wed 08-12 | **Magnet #1** | PMP cheat sheet → cipherexam.com/lp/pmp — link in post body; 10:40 wrapper check |
| Fri 08-14 | Authority | SME post #3 (draft exists — finalize, schedule by 08-13) |
| Mon 08-17 | Scoreboard | Week-1 real numbers + one question |
| Wed 08-19 | Authority | SME #4 via /sme-post from last-30-days topics |
| Fri 08-21 | **Magnet #2** | Sec+ PBQ walkthrough → /lp/security-plus — link in first comment |
| Mon 08-24 | Scoreboard | Week-2 numbers |
| Wed 08-26 | Authority | SME #5 |
| Fri 08-28 | **Magnet #3** | SHRM-CP map → /lp/shrm-cp — whichever link format won |
| Mon 08-31 | Scoreboard | Week-3 numbers |
| Wed 09-02 | Authority | SME #6 |
| Fri 09-04 | **Magnet #4** | Re-run the best-performing magnet with a new hook |

**Drafting process — every post type has a named pipeline; nothing is written on publish day:**

- **Authority posts:** drafted via the existing `/sme-post` skill into `posts.json` (`G:\Users\daveq\cipher-marketing\site\data\posts.json`), topics from `/last-30-days`. Already operating.
- **Magnet posts:** drafted via the existing lead-magnet pipeline — post record written to `posts.json`, magnet registered in `site\data\magnets.json` — on the **prior business day**: Tue 08-11 for magnet #1, Thu 08-20 for #2, Thu 08-27 for #3, Thu 09-03 for #4. Anatomy of each: a hook built on one specific number pulled from the magnet itself (a count of rules, questions, or steps — the sheet's real number, never invented), then 3–5 lines of the magnet's best content given away in the post, then the LP link with a fresh UTM. Post #1 puts the link in the body; post #2 in the first comment; compare 24-hour impressions and keep the winning format — a measurement, not a guess.
- **Scoreboard posts:** drafted inside the Monday 9:00 MT ritual itself (section 4) — the last step of the 20 minutes is copying the just-written `scoreboard.md` row into a post draft in `posts.json` and scheduling it for 10:30 the same morning. The ritual writes the post; there is no separate writing session to skip.

Never write "guaranteed pass" in any of them — the tripwire is locked (section 5). Scoreboard posts show funnel counts (captures, trials, paying N/10) but per the section-5 building-in-public screen, no revenue dollar figures, customer identities, or architecture.

**Scoreboard posts — the build-in-public angle.** Mondays from 08-17. Real numbers only, each ending with one question aimed at PMP candidates. The model is Levels documenting fly.pieter.com live with real numbers, and Kahl's rule that you build *with* the people you serve. Honest transfer: Levels had an enormous following; Dave has under 500. The mechanism copies — real numbers make posts people answer — the scale does not. Expect tens to low hundreds of impressions at first. The asset is the habit and the archive, not a viral hit.

**Daily comments — 15 min, Mon–Fri.** Search #pmp on LinkedIn filtered to the past 24 hours, plus Andrew Ramdayal's posts (the named PMP-content bar). Leave 3 substantive comments: answer the question asked or add a specific fact. Never mention CipherExam unless someone explicitly asks for resources. Never DM first. This is the entire outbound motion.

**Reply rule:** every comment on Dave's own posts gets an answer within 24 hours. Lifetime comment count is 0; the first stranger's comment matters more than a thousand impressions.

**Numbers to check:** per post at 24 h and day 7 — impressions, reactions, comments; grade each in the existing posts.json loop (8 posts graded to date, 6 D / 2 C; target: the first B). Weekly numbers roll into the Monday ritual (section 4).

**30-day thresholds, reviewed Mon 09-07:**
1. ≥1 post above 500 impressions (2× the all-time best of 238)
2. ≥5 total lead captures (from 0)
3. ≥3 comments from people outside existing connections
4. ≥1 trial attributed to LinkedIn — a `trial_start` with session source linkedin in GA4, **or** a Firestore user/lead doc carrying `utm_source=linkedin` (the Proof-1 backstop). Either counts; check both.

Score 2 or more → LinkedIn stays primary through September, Reddit enters as secondary. Score 0–1 → Reddit becomes primary on 09-08 and LinkedIn drops to publishing the already-drafted SME queue only. Separately, the authority track keeps its own locked kill criterion: fold after 12 authority posts with no signal (dated verdict Mon 09-28 — post #12 publishes Fri 09-25 per the section-6 extension calendar).

## Channel 2 — Standing links (Sat 08-08, 30 min, one-time)

- LinkedIn Featured section: add /lp/pmp and /lp/security-plus with UTM links.
- LinkedIn About section: rewrite the first two lines to name the free PMP cheat sheet and where it lives.
- Gmail signature (dquillman2112@gmail.com): one line — "Free PMP cheat sheet → [LP link]".

The Markus Kopko quote can sit on an LP, but re-confirm his written permission before using it in any post — it is rescindable and PMI-surface name restrictions apply (section 5).

## Channel 3 — Directory batch (Sat 08-08, ~3 h, $0)

One submission kit reused everywhere: product name, a one-liner under 60 characters, three screenshots (exam player, the Exam Lens explanation view, a CompTIA PBQ), a 150-word description naming the 12 exams and the free Starter tier, and a per-directory UTM link.

| Directory | Where | Price | Note |
|---|---|---|---|
| AlternativeTo | alternativeto.net → sign up free → user icon → "Suggest new application" | $0 | Traffic comes from appearing on existing exam-prep apps' "alternatives" pages — fill the alternatives field carefully. |
| SaaSHub | saashub.com/services/submit | $0 | The form requires competitor listings (omitting them delays approval) — name real ones, e.g. Pocket Prep. Skip paid upgrades. |
| Uneed | uneed.best | $0 "Join the line" (automatic launch date). Paid: $14.99 fast-track (~14 days out), $29.99 pick-your-date | Take the free line. |
| Google Search Console | search.google.com/search-console | $0 | Not a directory — same sitting. Verify the cipherexam.com property, submit the sitemap, URL-inspect the 3 cornerstone posts and 3 LPs. |

Product Hunt (producthunt.com/launch, $0) uses the same kit but is scheduled for **Wed 09-09** — after the 30-day window, so launch-day attention doesn't fragment the primary channel. Prep on 09-08: tagline, screenshots, and the maker's first comment written in advance. Never buy upvotes — Product Hunt bans paid-vote rings. Honest expectation with no existing audience: double-digit visits and a permanent profile plus backlink, not a spike.

**Number to check:** GA4 → Traffic acquisition → sessions by source (alternativeto, saashub, uneed, producthunt), every Monday. Expect single digits per week. Compounding background entries, not a growth lever.

## Channel 4 — Reddit (warmup Mon 08-24, posts from Tue 09-08)

Account: created **Sat 08-08 in the Saturday batch** (free, reddit.com, 2 minutes) — not on warmup day. Section 2's own warning applies: large subs auto-filter young accounts, so the account banks 16 days of age before the first warmup comment and ~3 weeks before the week-3 r/SideProject launch post. Bio line: "Building CipherExam (cert practice exams). I answer PMP questions." The bio is the only place a link lives by default.

| Sub | URL | Fit |
|---|---|---|
| r/pmp | reddit.com/r/pmp | PMP candidates — priority cluster #1 |
| r/projectmanagement | reddit.com/r/projectmanagement | broader PM audience |
| r/CompTIA | reddit.com/r/CompTIA | Sec+ PBQ walkthrough material |
| r/humanresources | reddit.com/r/humanresources | SHRM-CP audience — treat as value-only; assume promotion is banned here |

**Rules protocol, day one of warmup:** open each sub's sidebar rules and copy them verbatim into a `reddit-rules.md` file kept next to posts.json. Check it before every post. If a sub bans self-promotion outright, that sub stays value-only permanently. Hard defaults safe under any ruleset: no CipherExam link in any post body, ever; mention the product only when a commenter directly asks; keep at least 10 plain helpful comments for every 1 that mentions it. Large subs auto-filter young accounts — a second reason the warmup comes first.

**Warmup (08-24 → 09-07, 15 min/day):** answer questions in r/pmp and r/CompTIA. No links, no product mentions. Kahl's actual instruction — be useful inside their communities before asking for anything.

**Posts (from 09-08, one per week, alternating r/pmp and r/CompTIA):** convert magnet content into full native text posts that give everything away. Post #1: the PMP cheat sheet rewritten as a complete text post — no link, no ask. Post #2 (09-15 week): one Sec+ PBQ walked through step by step. The return path is the bio link and "where is this from?" comments. Slower, but the only path subreddit rules reliably allow. If asked how the questions are made, say exactly what is true: original, AI-generated against the public exam objectives — nothing scraped.

**Numbers to check:** upvotes and comments per post at 24 h; GA4 sessions with source=reddit every Monday; `leadCaptures` docs with a reddit source (the Proof-1 backstop makes this a Firestore query). Evaluation the week of 10-05: ≥1 post with 20+ upvotes, or ≥25 reddit sessions in a week — otherwise drop back to warmup-level participation only.

## Channel 5 — SEO (background, capped at 2 h/week)

Assets: the 3 cornerstone posts, already live. The 08-08 Search Console submission covers indexing. Every Friday: open the GSC Performance report, log impressions and clicks per cornerstone URL. **No new content during the 30-day window** — this machine's failure pattern is building instead of distributing. From 09-08: if any cornerstone shows 50+ impressions/week in GSC, write one page per week targeting the adjacent query it surfaces; otherwise monitor mode. Programmatic exam-objective pages stay parked until one cornerstone proves indexable demand. (The longer-horizon one-post-per-week compounding cadence is section 4's Kahl layer — it starts after the window.)

## Optional — Show HN for CipherExam (Tue 09-15, $0, conditional)

Show HN's rules: it is for things people can play with; sign-up barriers are explicitly unwelcome — a landing page is ineligible. Condition to check first, in a private browser window: the try-a-question experience must be reachable from cipherexam.com while logged out. If a signup wall fronts everything, skip entirely. If it passes: submit at news.ycombinator.com/submit with a title starting "Show HN:", and answer every comment for the following 24 hours. (deadline-shield's separate Show HN is Tue 08-25 — section 6.)

## What this plan refuses to do

- No sales calls, cold calls, pitches, or cold DMs. Anywhere. Ever.
- No standalone X posts — paused by the 08-07 decision; reply-only until ~100 followers.
- No paid spend before 25 activated users, then $2/day retargeting maximum — locked.
- No traffic to Migraine Tracker or deadline-shield until their payment paths actually fulfill.
- No "guaranteed pass" language, no implication of real exam questions — original, AI-generated against public objectives, said plainly whenever asked.
- No purchased upvotes, votes, or engagement on any platform.

## Budget

Mandatory spend: **$0.** Optional: $29.99 (Uneed pick-your-date) — skip until `leadCaptures` > 0 proves the funnel converts a stranger. Time: roughly 5–6 hours per week, plus the one-time 2–3 hour Day-0 proofs. The week is won or lost in the Monday row, not by feel.

---

# 3. Pricing

Three rules govern every number below.

1. **Week-1 assets sell at prices that exist in Stripe live today.** CipherExam's $59 Exam Pass and $19/mo Pro are the only prices with a working fulfillment loop. No new tiers, no new SKUs, no relitigating the deleted annual plan.
2. **Every price is anchored to a competitor price verified by live fetch** (page-watch and card comps fetched 2026-08-07; cert-prep comps previously verified in FACTS).
3. **With $0 recorded revenue, a price change is a guess.** Each decision names the exact evidence that would change it — and now also the dated fallback if that evidence never arrives. Until the evidence exists, the price is frozen.

Count payers with `functions/scripts/list_users.js` (Cipher) and Stripe Dashboard → Payments, nothing else — never the Admin-Core RevenueDashboard (summary line 10).

## Price board

| Asset | Price today | Decision | Verified anchor |
|---|---|---|---|
| CipherExam Exam Pass | $59 one-time, 90 days | **Keep. Leads on every LP.** | Elite Minds $59/yr; Brain Sensei $349.99/yr |
| CipherExam Pro | $19/mo, 7-day no-card trial | Keep. Second position on LPs. | Pocket Prep $14.99–29.99/mo; Claru $12.99/mo |
| CipherExam Starter | Free (20/day taste week → 5/day) | Keep. Untouched. | — |
| Migraine Tracker | $4.99/mo, 7-day trial | Keep the number. Fulfillment rebuild comes first. | Migraine Buddy ~$4.99–9.99/mo |
| deadline-shield | Solo $29 / Pro $59 / Team $149 per mo | Keep through first checkout. Copy must earn the delta. | Visualping $14–70/mo; Distill $15–80/mo; ChangeTower $12–78/mo |
| cardledgerpro | Free / Pro $29 / Power $79 (UI only, no Stripe) | Park. Zero pricing work until a deploy decision. | Card Ladder $19.99/mo; CollX Pro $9.99/mo |
| Q-Photos | Per-print configurator, manual invoice | Keep as-is. | — |
| Q-IC, TraderQ, cronspire, projectcalm, MFI, others | none | No pricing surface. No pricing work this cycle. | — |

## CipherExam: Exam Pass leads, Pro follows

**Decision: the $59 Exam Pass is the primary offer on /lp/pmp, /lp/security-plus, and /lp/shrm-cp. Pro $19/mo is the visible second option. Starter stays as the free floor.**

Why Pass leads:

- **The LP visitor is a booked-date buyer.** Traffic comes from exam-specific magnets and posts. Someone downloading a PMP cheat sheet has a sit date or is picking one. A defined-endpoint purchase matches a defined-endpoint problem. A subscription asks them to remember to cancel; a 90-day pass asks nothing after the exam.
- **The math is revenue-neutral, so lead with the better converter.** $59 once ≈ 3.1 months of Pro ($57). Typical PMP prep runs 8–13 weeks. Cipher gives up almost nothing in expected revenue and drops the cancellation objection.
- **Pass is money today; Pro is money in 8+ days.** Pro's 7-day no-card trial means the earliest Pro dollar is day 8. A Pass checkout is a same-session dollar, and a Pass buyer is a paying user on the N/10 scoreboard tonight.
- **$59 is a pre-anchored number in this market.** Elite Minds charges $59/yr for a PMP simulator; Brain Sensei $349.99/yr. $59 for 90 days of full access sits low against the category ceiling and exactly on an existing competitor price point — no explaining required.

Why $59/90-days and not $49, $79, or annual: it exists in Stripe live right now with webhook fulfillment and a refund path — any other number is a build task in week 1 (rule 1). 90 days covers the realistic prep window with slack; the 60-day money-back guarantee already de-risks the one-time ask. The annual tier was deleted 08-04; it stays deleted — do not recreate it as a "discount" instinct.

Pro's job: catch the browser without a date, and the repeat-cert professional (CompTIA → PMP → SHRM ladder). At $19/mo it sits inside Pocket Prep's $14.99–29.99 band with a stronger feature story (Exam Lens, PBQs). No change.

**Evidence that changes this — each trigger with its dated fallback:**

- If, after 200 unique LP sessions (GA4 funnel events already fire), Pass checkout-starts are under 2% while Pro trial-starts run above 6%, flip the lead position — a copy/button swap, not a Stripe change. **Fallback: if 200 LP sessions have not accumulated by Mon 2026-09-07 (the 30-day review), the bottleneck is distribution, not price — the price question is not even open; act on the section-2 channel thresholds instead.**
- If 25+ Pass checkouts start and fewer than 20% complete, test $49 — one new Stripe price, one LP button edit, ~15 minutes. Not before. **Fallback: if fewer than 25 checkout-starts exist by Fri 2026-10-02 (week-8 board read), $59 is untested, not failed — carry it into weeks 9–12 unchanged.**
- If 3+ support emails ask for more than 90 days, sell a $19 one-month extension using the existing Pro price object rather than lengthening the Pass. **Fallback: if fewer than 3 such emails by Fri 2026-10-02, the 90-day window is right; drop the question.**

## Migraine Tracker: $4.99 stays, but the price is not the decision

MT billing cannot fulfill — bare Payment Link, no webhook, no paid state ever set. The real week-1 decision is *no pricing work at all*: a price on a broken pipe converts at exactly 0%. (The rebuild-or-sunset gate is section 4.)

**Decision: if the billing rebuild ever happens, recreate one price — $4.99/mo, 7-day trial — as a proper Stripe subscription with webhook fulfillment. No annual tier, no second tier.**

- $4.99 sits at the floor of Migraine Buddy's ~$4.99–9.99/mo range. For an app with 2 recorded users and 0 retained, the floor is correct: the bottleneck is distribution and retention, not willingness-to-pay.
- One price = the smallest possible rebuild. Every added tier is added webhook states, added `subscriptionService` branches, added test surface.

**Evidence that changes this:** 25 completed trials post-rebuild. If fewer than 2 convert, the problem is retention, not price — fix the day-2 experience before touching the number. If 5+ convert and churn is low, test $6.99 on new signups only (grandfather the rest). **Fallback: if the Fri 2026-08-21 gate rules sunset (the expected outcome), this trigger is void — no MT pricing work exists on any calendar.**

## deadline-shield: keep $29/$59/$149, and make the copy earn the gap

Comparable page-watch tools, prices fetched from their live pricing pages 2026-08-07:

| Tool | Entry | Mid | Upper |
|---|---|---|---|
| Visualping | $14/mo (10 pages, 1K checks) | $35/mo (20 pages, 5K checks) | $70/mo personal; Business from $140/mo |
| Distill.io | $15/mo (50 monitors) | $35/mo (150 monitors) | Flexi $80+/mo |
| ChangeTower | $12/mo (25 pages) | $36/mo (100 pages) | $78/mo (200 pages) |

Honest read: **Solo at $29 is roughly 2x the category entry price ($12–15).** Pro $59 is ~65% above the $35–36 mid band. Team $149 is above ChangeTower's $78 but in line with Visualping Business at $140.

**Decision: launch at $29/$59/$149 anyway.**

- The full Stripe path (SDK, create-checkout, webhook) is already built and deployed at these prices. Changing them before the go-live checklist is even cleared is work spent on zero data.
- A premium over Visualping/Distill is defensible only if the LP sells the difference explicitly: meaningful-change detection and deadline framing versus raw diff alerts. The landing copy must show one concrete example — "Visualping tells you 40 pixels changed; deadline-shield tells you the filing date moved" — or the $29 loses every comparison shop.
- 14-day card-required trial already filters for intent; keep it.

Two named checks before go-live (checklist items, not builds):

1. Confirm Solo's included page count. If under 25 pages, ChangeTower's $12/25-page tier strictly dominates it and the LP cannot survive a side-by-side. Raise the limit in config or expect zero conversions from comparison shoppers.
2. State the page/frequency limits on the pricing page. All three competitors do; a limitless-looking $29 reads as a trap.

**Evidence that changes this:** first 100 LP sessions. If trial-starts are 0, create a $19/mo Solo price in Stripe (new price object, old one kept for any existing subscriber) — still above Distill's $15, defensible on the meaningful-change story. If trials start but die at the card wall, test 7-day no-card before touching price. **Fallback: if 100 LP sessions have not accumulated by Fri 2026-10-02, the problem is launch traffic, not price — the $29/$59/$149 ladder carries unchanged into the 10-02 board read.**

## cardledgerpro: parked — the numbers are sane, the product isn't live

No deployment (empty .firebaserc), no Stripe, Upgrade button goes nowhere. **Decision: zero pricing work until a deploy decision is made elsewhere.** For the record, against comps fetched 2026-08-07:

- Card Ladder PRO: $19.99/mo, $199.99/yr (collector market-value tracking; App Store listing).
- CollX Pro: $9.99/mo, $99.99/yr (collector scanning/marketplace; official pricing page).
- SportsCardNetwork (dealer software, per its 2026 buyer's-guide pages): Starter $19.99/mo, Dealer $59.99/mo — search-verified only; re-fetch before ever putting it in copy.

The decided Free/$29/$79 ladder holds up: $29 Pro is above collector-tool prices ($9.99–19.99) but this is dealer software — inventory plus market value is a business expense, not a hobby fee. $79 Power sits above the $59.99 dealer anchor; hold it, revisit only after 5 paying Pro users hit the lookup meter. The 25 lookups/mo free meter is the right free floor — keep it.

**Evidence that changes this:** the deploy decision itself. If it ships, keep $29, and do not build the $79 tier's Stripe price until one Pro user asks for more than Pro's limits. **Fallback: no deploy decision is scheduled before Fri 2026-10-02; cardledgerpro stays parked at least until the week-8 board read puts it on an agenda.**

## Everything else: no price, no pricing work

- **Q-Photos** already prices per-print in the configurator and invoices manually. Flipping the card-payment flag is a fulfillment decision for another day; the prices need nothing.
- **Q-IC Suite, TraderQ, cronspire, projectcalm, 3iatlas, POD-Store-Creator** have no monetization surface. Inventing prices now would violate rule 1 twice over. **MFI's** $45K pilot pricing stays in reserve behind its triggers; B2G is outside this plan.

The portfolio is at stage-1 pre-product-market-fit ($0 MRR). At that stage the pricing job is not optimization — it is removing every reason a ready buyer stalls. That is why the one-time $59 Pass leads, why nothing gets a new tier, and why every change above waits for a named number of real sessions, trials, or payers — with a named date on which "the number never came" becomes its own answer.

---

# 4. Recurring-revenue layer

A $59 Exam Pass sale is a spike. A $19/mo subscription that survives its second invoice is revenue that holds. Only CipherExam can hold revenue today. So this layer is: tighten CipherExam's trial-to-paid machine, turn on Stripe's churn defenses, put one dated gate on MT — and one on CipherExam's own subscription engine — and feed the three assets that compound.

## 4.1 The trial-to-paid machine as deployed — and three defects in it

The pipeline that exists in `G:\Users\daveq\Cipher\functions\src` (this is where the drip lives — the two files named here are the ones every email step in this plan touches):

- Signup → `createUserProfile` (`index.ts:24`, Auth onCreate) writes `users/{uid}`.
- `scheduleOnboardingDrip` (**`onboardingDrip.ts`**, Firestore onCreate on `users/{uid}`) schedules the Day 4/5/6/7 emails in one shot via Resend `scheduled_at`. Day 6 is the pricing/retake-cost email; Day 7 is "Your trial ends tomorrow" — the convert pair. Day 0 and Day 3 stay manual founder emails by design until ~50 activated signups/week (the file's header also lists Day 6 as manual, but Day 6 is in the automated `DRIP_SEQUENCE` — trust the code).
- Lead capture → `sendLeadMagnetWelcome` (**`leadMagnetWelcome.ts`**, Firestore onCreate on `leadCaptures/{captureId}`) schedules the 3-touch deliver→prove→invite sequence.
- Trial → `startTrial` (`startTrialCallable.ts`), no card.
- Convert → `createCheckoutSession` (`stripe.ts`), live monthly price `price_1TH4B4BH0CNhR0VajnZ1kBMi`; `stripeWebhook` sets `isPro`/`access: 'paid'` with idempotent event claims; `customer.subscription.deleted` revokes to Starter.

Four defects — 1–3 fixable by 2026-08-08, defect 4 by Tue 08-11, all on the same deploy path:

1. **Two deployed emails sell a price that no longer exists.** `onboardingDrip.ts:96` and `leadMagnetWelcome.ts:158` both say "$189/year." The annual price was deleted from live Stripe on 2026-08-04 (`billingConfig.ts` documents it). Anyone acting on the Day-6 email hits a pricing page with no annual option. Fix: rewrite both lines to "$19/month, or a one-time $59 Exam Pass," redeploy functions.
2. **The trial is marketed as 7 days but granted as 14.** `startTrialCallable.ts:6` has `TRIAL_DAYS = 14`, and `web/src/components/TrialModal.tsx` says "14-day Pro trial," while every SEO surface, the drip footer, and the Day-7 "ends tomorrow" email say 7. Fix: set `TRIAL_DAYS = 7`, correct the modal copy — 7 is what every public surface promises. (Known skew that can stay: the drip counts from signup, the trial from clicking Start Trial. Fix only if replies show confusion.)
3. **The Resend key's deploy state is unproven.** Section 1, Day 0, step 2 is the proof: test signup → `systemHealth/email` `ok: true` and 4 scheduled sends visible in the Resend dashboard. Until both are seen, assume signups receive nothing.
4. **Neither automated sequence checks the opt-out flag, and the deployed templates are unaudited for CAN-SPAM.** The `emailOptOut` suppression filter is wired only into the one-off broadcast scripts (`send_exam_pass_note.mjs`, `send_broadcast.mjs`); `scheduleOnboardingDrip` and `sendLeadMagnetWelcome` schedule sends with no suppression check, so an opted-out lead who later signs up (or re-submits a magnet form) re-enters an automated sequence. And nothing on record confirms the already-deployed drip and 3-touch welcome templates carry an unsubscribe mechanism and postal-address footer. Fix, dated **Tue 08-11 — hard deadline, because the first real stranger can enter the funnel via magnet post #1 on Wed 08-12**: audit every template in both files for a working unsubscribe (the section-1 mailto: line at minimum) and the postal-address footer, adding either wherever missing; add an `emailOptOut == true` early-return check at the top of both functions; deploy. This is section-5 checklist item 4, pulled forward from the undated "before first $1,000" list to a calendar date that precedes the first send to a stranger.

Cost of the sending layer: $0. Resend's free tier is 3,000 emails/month, 100/day (verified 2026-08-07). Upgrade trigger is >100 sends/day, which is Resend Pro at $20/mo — a problem worth having.

## 4.2 The three Walling campaigns, mapped to this codebase

| Campaign | Exists today | Gap | Build |
|---|---|---|---|
| Signup abandonment | Yes — `captureLead` (`captureLead.ts`, callable, 15/IP rate limit) writes `leadCaptures/{email__cluster}`; `sendLeadMagnetWelcome` schedules the 3-touch sequence | Lead→trial overlap: a lead who converts gets the remaining lead touches AND the onboarding drip. The scheduled Resend message IDs are already persisted on the capture doc; the cancel hook was never built | In `scheduleOnboardingDrip`, on `users/{uid}` create, look up `leadCaptures` by email and `POST https://api.resend.com/emails/{id}/cancel` for each pending ID (endpoint verified 2026-08-07). ~40 lines, by **2026-08-14** |
| Trial extension | Nothing for subscription trials (`extendExamPass` in `examPass.ts` is the pass rescheduler — different job) | Walling: ~50% of trials never use the app; a low-activity extension offer recovers some. Manual is explicitly acceptable | Manual, Monday: `node functions/scripts/list_users.js` prints plan/trial/subscriptionStatus per user. Any trial ending within 48h with low use gets one personal, reply-able email from dave@cipherexam.com (only after the Day-0 mailbox round-trip passes; until then, `reply_to: dquillman2112@gmail.com`) offering +7 days; apply it in Admin-Core → Users → Extend trial — **not verified on disk: confirm in week 1 (by Fri 08-14, 4.7) that this action actually exists**; if it doesn't, the fallback is editing the trial-end field on the `users/{uid}` doc in the Firestore console, same effect, then filing the button as a later build. Automate as `functions/src/trialRescue.ts` on `functions.pubsub.schedule` only past 20 trials/week |
| Dunning | Nothing — `stripeWebhook` (`stripe.ts:198`) handles only `checkout.session.completed` and `customer.subscription.deleted`; `invoice.payment_failed` falls to "Unhandled event type" | Payment failure is up to half of churn and currently invisible | No code. Stripe Dashboard, **Monday 2026-08-10**: Billing → Revenue recovery → Retries — enable Smart Retries (default 8 attempts over 2 weeks), end-state "Cancel the subscription" (emits `customer.subscription.deleted`; `handleSubscriptionDeleted` already revokes access). Settings → Billing → Subscriptions and emails — enable "Send emails when card payments fail" and "Send emails about expiring cards"; point Payment method updates at the Stripe-hosted customer portal (`createPortalSession` already serves it in-app). All verified 2026-08-07; included in Stripe Billing at 0.7% of billing volume — $0.13 on a $19 charge |

This configuration satisfies Walling's three dunning rules by default: Stripe emails only after a failure, Smart Retries spaces attempts, and the hosted portal makes the card update one click.

Honest caveat on campaign #1: `leadCaptures` has 0 documents all-time. The abandonment machinery is built and idle; what it lacks is traffic — section 2's job, not another email function.

## 4.3 Exam Pass expiry is the re-purchase engine — if someone sends the email

The $59 pass (`examPass.ts`, inline `price_data`, `unit_amount: 5900`) expires 90 days after purchase. `extendExamPass` grants exactly one free extension when the snapshotted exam date slipped just past expiry; after that it returns `paid_extension_required` — a reason code pointing at a $19/30-day product that was never built. Do not build it yet; build it the first time a real user hits that code (check `stripe_events` and function logs).

What to build by 2026-08-14: `functions/src/passExpiryEmail.ts`, scheduled daily with `functions.pubsub.schedule` (same pattern as `checkForExamUpdates`, `index.ts:1319`). Query `users` where `entitlement.type == 'exam-pass'` and `expiresAt` is within 7 days. One Resend email, three self-serve paths:

- Exam moved past your pass? One-click free extension (`extendExamPass`).
- Passed? Reply and say so — nothing to buy.
- Next cert? Second $59 pass, or $19/mo Pro for all 12 exams (`createCheckoutSession`).

A pass buyer is $19.67/mo-equivalent for 90 days. This email is the only mechanism that turns that spike into a second transaction. No calls, no pitches — a scheduled function and two buttons.

## 4.4 The Monday ritual — one sitting, every Monday 9:00 MT, before the 10:30 post slot

With under ~30 customers a churn percentage is noise; count events. One combined 20-minute ritual (this is the single scoreboard ritual the whole plan references):

1. Stripe Dashboard (live mode) → Billing → Subscriptions, filter Active → **active paid subscriptions**.
2. `node functions/scripts/list_users.js` in `G:\Users\daveq\Cipher\functions` → paying count, activated count, trials started last 7 days, trials expiring next 7. The activated number also gates paid spend (25 activated → $2/day retargeting only — locked).
3. Stripe Dashboard → Subscriptions, filter Canceled (+ Revenue recovery report once retries are on) → cancellations last 7 days, split voluntary vs payment-failure.
4. Admin-Core Billing page → `billing_events_unresolved` count (`Admin-Core\functions\index.ts:765` counts the collection). **Must be 0** — nonzero means someone paid and got nothing. Fix same day.
5. Firebase console → Firestore → `leadCaptures` → document count, and counts by `utm_source` (the Proof-1 backstop fields).
6. GA4 → Reports → Traffic acquisition → sessions by source; lp_view → capture conversion; `trial_start` count by source.
7. LinkedIn analytics → trailing 7-day impressions, follower count.
8. Write one row in a new `scoreboard.md` (do not resurrect the stale campaign-state block): date, paying/10, activated/25, leads, trials by source, LI impressions 7d, followers, sessions by source. **Then draft the Monday scoreboard post directly from that row into posts.json** (section 2's drafting process) — the ritual writes the post.

Row 1 populates the qcode board's chosen scoreboard — "CipherExam's first 10 paying users," currently rendering 0/10. Update it every Monday, even while it says 0. Do not read MRR off Admin-Core's Revenue page until `RevenueDashboard.tsx:11`'s `PRICE_PER_USER = 9.99` hardcode is replaced with real per-product pricing (any Monday, before ever quoting MRR); a $59 pass is not MRR at all. Until then, the Stripe Dashboard is the only revenue truth.

**CipherExam subscription gate (dated, same discipline MT gets):** if the Monday **2026-09-28** scoreboard row — the last row before 09-30 — still shows **0 active paid subscriptions**, the rule fires: no further subscription-side build hours (no trialRescue automation, no new drip work beyond what is already deployed), Pro drops to a one-line mention on the LPs, and all CipherExam conversion effort concentrates on the $59 Exam Pass, which can be selling even while subscriptions sit at 0. The full pause-or-continue call then belongs to the Fri 2026-10-02 board read with 8 weeks of clean rows in front of it — but the build-hour freeze is automatic on 09-28, not discretionary.

## 4.5 Migraine Tracker: rebuild billing or sunset it, on a date

State: 2 real users at last measurement (2026-05-28), 0 paid. The $4.99/mo tier is a bare Stripe Payment Link with no webhook; `src\services\subscriptionService.ts` can only ever return "trial" or "expired" — there is no paid state a payment could unlock.

- **By 2026-08-08:** deactivate the Payment Link (Stripe Dashboard → Payment links → Deactivate) and hide the upgrade CTA. A link that can take $4.99 and fulfill nothing is a refund generator and a complaint risk, not revenue.
- **Zero MT hours** between now and the gate.
- **Gate: Fri 2026-08-21** (the sequence's gate calendar governs the date; the threshold below is the more specific of the two on record). Run `node scripts/mt-metrics.mjs` in `G:\Users\daveq\Admin-Core`.
  - Weekly-active users < 25 (the expected outcome, given 2 known users): **sunset the paid tier.** MT stays live as a free app. No billing rebuild unless organic use appears on its own; revisit only after CipherExam MRR ≥ $500.
  - Weekly-active users ≥ 25: rebuild by porting the deployed deadline-shield pattern — `G:\Users\daveq\deadline-shield\functions\src\stripeWebhook.ts` plus its checkout function — 1–2 days, webhook-set paid state replacing the Payment Link. Health-data privacy policy ships before the first $4.99 (section 5).

The 25-WAU bar exists because rebuilding billing for 2 users costs the same days the CipherExam convert emails need, and those emails sit in front of the only live revenue path.

## 4.6 The assets that compound (the Kahl layer)

Kahl's Podscan lesson: the things that made revenue hold were boring assets fed for eighteen months. The equivalents here:

- **Email capture on every surface.** The list is the only owned channel. `captureLead` is live on all three LPs — and has captured 0 leads ever, because no published post has ever pointed at a magnet (section 2 ends that on 08-12). Add the magnet CTA block to each of the 3 live cornerstone blog posts (cipher-marketing repo), linking to the matching /lp/ page. Lapsed trials stay on the list too (`users` docs keep the email) — future product-update emails cost nothing to send.
- **SEO cadence: one post per week into the PMP cluster** (locked priority #1), every post ending in the magnet CTA — starting after the 30-day no-new-content window (section 2, Channel 5). Three cornerstone posts exist today; at one a week that is 55 by August 2027 — 55 permanent doorways to the list. Kahl waited eighteen months before programmatic SEO paid; expect the same silence and publish anyway.
- **The question-bank data moat.** Every answered question feeds `getAdaptiveQuestions` (`index.ts:102`) and `evaluateQuestionQuality` (`quality.ts`). More answers → better routing and a better bank → something a competitor cannot scrape or clone. The moat only accrues while questions get answered — a second reason the free Starter tier (20/day taste week) stays open.
- **10-80-10 on founder email.** The Day-0 and Day-3 manual founder emails are the human 10%. Keep them manual until 50 activated signups/week — the threshold `onboardingDrip.ts` itself names — then promote them into the automated sequence using real reply themes, not invented copy.

## 4.7 Order of operations

| When | Action |
|---|---|
| By 2026-08-08 | Fix $189 copy in `onboardingDrip.ts:96` + `leadMagnetWelcome.ts:158`; `TRIAL_DAYS` 14→7 + TrialModal copy; deploy functions; verify `systemHealth/email` ok:true with a test signup and 4 scheduled sends in Resend; deactivate the MT Payment Link |
| Mon 2026-08-10 | First Monday ritual row; flip Stripe dunning settings: Smart Retries 8/2wk, cancel-on-exhaust, failed-payment + expiring-card emails, hosted portal for card updates; **rotate the plaintext prod service-account keys in factory/phoenix-engine** (Google Cloud console — the only known live exposure in the plan; a leaked prod key is a today-risk independent of revenue, so it gets a calendar date, not a revenue trigger) |
| By Tue 2026-08-11 | Defect-4 compliance deploy (4.1): unsubscribe + postal-address footer confirmed in every `onboardingDrip.ts` / `leadMagnetWelcome.ts` template; `emailOptOut` suppression check added to `scheduleOnboardingDrip` and `sendLeadMagnetWelcome` — live BEFORE magnet post #1 (Wed 08-12) can capture a stranger |
| By Fri 2026-08-14 | Lead→trial cancel hook in `scheduleOnboardingDrip` (Resend `POST /emails/{id}/cancel`); build and deploy `passExpiryEmail.ts`; dry-run `node scripts/mt-metrics.mjs` in `G:\Users\daveq\Admin-Core` (untouched since the 05-28 measurement — the 08-21 MT gate must not be its first run in 12 weeks; fix or replace it this week if it errors); verify the Admin-Core → Users "Extend trial" action exists (4.2 — Firestore-console field edit is the fallback) |
| Any Monday, before quoting MRR | Replace `PRICE_PER_USER = 9.99` in `RevenueDashboard.tsx` with real per-product pricing |
| Fri 2026-08-21 | MT gate: `mt-metrics.mjs`; <25 WAU → sunset paid tier, ≥25 → port deadline-shield's Stripe path |
| Mon 2026-09-28 | CipherExam 0-subscription rule (4.4): 0 active paid subs → subscription build-hour freeze, Pass-only focus, decision to the 10-02 read |

Nothing in this layer requires a call, a pitch, or a new tool subscription. It requires four file edits, six dashboard toggles, one scheduled function, and the same 20 minutes every Monday.

---

# 5. Liability & legality screen

Every step in this plan passes through this screen before it ships. One thing said plainly, once: this is protective scoping by a non-lawyer, not legal advice. It exists to keep the plan inside three constraints — nothing illegal, nothing that creates liability, and nothing that jeopardizes the two working assets (a live Stripe account and one usable channel).

Three blocking rules apply to every other section:

1. **No public claim ships unless it is on an asset's DO list below.** Copy, LP, email, post — all of it.
2. **No pipe charges a customer unless it can fulfill.** Charging MT's broken Payment Link ($4.99 in, nothing delivered) is not a bug — it is a refund demand, a chargeback, and a deceptive-practice complaint in one. The only MT billing step allowed is the rebuild itself.
3. **Excluded assets stay excluded.** TraderQ (performance claims = SEC/FTC exposure), MFI (defamation and PHI; sales paused behind T1–T4), and any real-money Q-Poker variant are outside this plan. No step may route revenue through them.

## Rule table: DO / DON'T per asset

| Asset | DO | DON'T |
|---|---|---|
| **CipherExam** (the revenue lead) | Sell prep and practice. Say "practice exams," "original questions," "study tool." State the 60-day money-back guarantee — and honor it. Footer disclaimer on every page and LP: "PMP and PMI are registered marks of the Project Management Institute, Inc. CompTIA Security+ and SHRM-CP are marks of their respective owners. CipherExam is an independent study tool, not affiliated with or endorsed by PMI, CompTIA, or SHRM." | No "guaranteed pass," ever (already banned on disk — the ban holds). No pass rates or efficacy stats — with 0 paying users, any number is fabricated, and fabricated claims run into FTC deceptive-advertising exposure. No exam-body logos. No "real exam questions" language — the questions are original, AI-generated against public exam objectives, and that provenance is the legal moat; saying "real" would claim copyright infringement you didn't commit. |
| **Email sequences** (drip + magnet welcome) | Physical postal address in every footer (home street address is legal and $0; a USPS PO Box works if preferred — priced by location at usps.com). Working one-click unsubscribe, honored within 10 business days — including the mailto: mechanism named in section 1 for script sends. Subject lines that match the body. | No sending until the Resend key is confirmed in the deployed runtime (section 1's proof). No second sequence to someone who unsubscribed from the first: until the 08-14 cancel hook lands, one suppression list does not exist — building it IS a compliance task, not polish. CAN-SPAM penalties run up to $53,088 per non-compliant email, per recipient. |
| **LinkedIn** (the one channel) | Native scheduler only (already decided — also the compliant answer; LinkedIn bans automation tools and banned accounts are dead channels). Posts share lessons and opinions. | No third-party posting/scraping/connection automation. Building-in-public screen: no revenue numbers, customer counts, architecture diagrams, or dependency lists in public posts — a solo product with $0 moat and a public blueprint is a weekend clone for anyone with an LLM subscription. Interesting, not easy. |
| **Testimonials** (Markus Kopko quote) | Before first publication: written re-confirmation by email, stored. Publish with a version that omits or downplays the PMI role where the surface could imply PMI endorsement (his PMI-surface name restrictions are real). Remove within days if he rescinds — GDPR gives him that right. | No paraphrasing that strengthens the claim. No invented or composite testimonials, anywhere, ever — the FTC's Consumer Reviews and Testimonials Rule (16 CFR Part 465, in force since Oct 2024) carries civil penalties up to $53,088 per violation. Firestore says 0 published testimonials; keep that count honest. |
| **Migraine Tracker** | "Track," "log," "spot patterns," "share with your doctor." General-wellness framing only. | No treatment, prevention, diagnosis, or efficacy claims — not a medical device and must never sound like one. No charging until webhook fulfillment is rebuilt (blocking rule 2). When it does charge: health-data privacy policy first — health apps sit under the FTC Health Breach Notification Rule, and no ad SDKs touch this data. |
| **deadline-shield** | Sell "meaningful-change alerts." Go-live requires: ToS with a limitation-of-liability clause capping damages at fees paid, and a plain line that it supplements — not replaces — the user's own calendaring. The 14-day card-required trial must state the charge amount and date before card entry, with self-serve cancel via the Stripe customer portal (included with Stripe, $0 extra) — ROSCA's floor. | The product name invites reliance; the copy must not. No "never miss a deadline." Monitor public pages at polite frequency only — no login-walled pages, no CAPTCHA bypass, nothing a target site's ToS plainly forbids. |
| **Q-Photos** | Keep selling prints. State a return policy before flipping the card-payment flag. | Don't ignore sales tax: physical prints are tangible goods — taxable in the home state from the first in-state sale (tax section below). |
| **cardledgerpro** | Parked (section 3). If it ever ships: label market values "estimates, not appraisals." | No grading or authenticity claims. |
| **TraderQ** | Leave it "open source for personal use." | Excluded. No pricing, no performance claims, no backtest screenshots, no "returns" language, no financial-advice framing — compensation plus personalized recommendations is investment-adviser territory (SEC/state RIA). |
| **MFI** | Dogfood quietly. | Excluded. No public post names a provider (defamation). No PHI in any screenshot, demo, or marketing asset. |
| **Q-Poker** | Play money only, as designed. | No real money, no prizes with entry fees — prize + chance + consideration is a lottery. This decision stays made. |
| **Q-IC / cronspire / projectcalm / 3iatlas / POD** | Nothing needed — no monetization surface, no claims surface. | Don't invent one this cycle. |

## Money handling: refunds beat disputes, every time

- The 60-day money-back guarantee is advertised, so it is binding — the FTC treats an unhonored guarantee as deception. Process any refund request within 48 hours, no argument, via Stripe Dashboard → Payments.
- Fast refunds are cheap insurance: refunding a $59 Exam Pass costs the ~$2.01 in Stripe processing fees (2.9% + 30¢), which Stripe keeps on refunds. A dispute costs $15 in fees, the $59, and a strike against the account. Stripe's own docs: a fully refunded card charge **cannot** be disputed. Refund fast, always.
- Refund Dave's own runbook verification buys immediately and exclude them from every metric. Stripe Tax's threshold math auto-adjusts for refunds, so this also keeps the tax picture clean.

## Taxes the first dollar triggers

**Home state first — and the home state is not written down anywhere on disk, so resolving it is Day-1 checklist item #1** (it is literally item #1 on the Tomorrow-morning list at the end of this document): **confirm the home state; check its Department of Revenue page for SaaS taxability AND physical-print taxability; register only there until Stripe Tax monitoring alerts.** This plan does not guess the state, because the answer flips the registration decision both ways.

**Sales tax, the threshold reality in three sentences.** Roughly 22 states plus DC tax SaaS subscriptions; the rest don't. Remote-state obligations only start at economic-nexus thresholds — $100,000/year in sales in 41 states — which this plan will not touch in year one. The only state that matters from dollar one is the home state, because physical presence is nexus with no threshold.

The concrete step (15 minutes once the state is confirmed): look up "SaaS taxability" plus the state on its DOR site. If the home state taxes SaaS, register for a sales tax permit (free in most states, under $100 in the few that charge) and enable Stripe Tax pay-as-you-go — 0.5% per transaction, charged only where registered, no monthly fee (Tax Basic, no-code; verified 2026-08-07). Either way, turn on Stripe Tax's threshold-monitoring dashboard now: it is $0 and emails when any jurisdiction needs attention (alerts begin once yearly revenue passes $10,000). One caveat from Stripe's own docs: monitoring deliberately excludes your home state — that check is the manual one above. Q-Photos prints are tangible goods: taxable in the home state in nearly every state with a sales tax, so the same registration covers them.

**Income tax.** Every dollar is taxable from dollar one — whether or not Stripe ever sends a 1099-K. Default structure is sole proprietor: net profit on Schedule C, self-employment tax 15.3% on top of income tax. Working rule: **move 30% of every Stripe payout into a separate account the day it lands.** Open a dedicated business checking account — Mercury is $0/month, no minimums (verified 2026-08-07); a second free account at the existing bank also works. Quarterly estimates (Form 1040-ES, free via IRS Direct Pay) are due Apr 15, Jun 15, Sep 15, Jan 15; at sub-$10k profit the underpayment penalty is small, but start the quarterlies the first quarter after $2,500 in net profit rather than gambling on it.

## Before first $1,000 — compliance checklist

| # | Item | Tool / account | Price |
|---|---|---|---|
| 1 | **Confirm home state; check its DOR page for SaaS + physical-print taxability; register only there until Stripe Tax monitoring alerts** (the unknown-on-disk item — resolve before anything else on this list) | State DOR site | $0 to check; 0.5%/transaction Stripe Tax only where registered |
| 2 | Verify cipherexam.com has a privacy policy, ToS, and written refund policy (the 60-day terms). If any is missing, publish before the next LP push. **Dated: Sat 08-08** — the Saturday batch, on the first-72-hours checklist — because the first LP push is Wed 08-12 and an undated "before the next push" check can otherwise run after it. | Termly Free (1 basic policy, 10,000 banner views/mo); ToS + refund page as plain pages | $0 (Termly Pro+ is $15/mo per site billed annually if unlimited policies are ever needed) |
| 3 | Add the trademark disclaimer footer (PMI/CompTIA/SHRM text above) to site, LPs, and email templates | One edit in the Cipher repo | $0 |
| 4 | Build the unsubscribe cancel hook so one opt-out suppresses BOTH sequences; confirm physical address in every email footer; wire the section-1 mailto: suppression flag into every send script AND into the automated functions themselves (`scheduleOnboardingDrip`, `sendLeadMagnetWelcome`) — broadcast-script-only suppression lets an opted-out lead re-enter an automated sequence. **Dated, no longer "before first $1,000": template audit + function-level `emailOptOut` check by Tue 08-11 (4.1 defect 4, before the first stranger on 08-12); cancel hook by Fri 08-14 (4.7).** | Existing Resend account + Cipher functions | $0 |
| 5 | Verify the deployed functions runtime actually has the RESEND key before any commercial send | Firebase console / functions config | $0 |
| 6 | Turn on Stripe Tax threshold monitoring | Stripe Dashboard → Tax | $0 |
| 7 | Written re-confirmation email from Markus filed before his quote appears anywhere | Gmail, one email (he sends it, not a form) | $0 |
| 8 | Rotate the plaintext prod service-account keys in factory/phoenix-engine. **Dated: Mon 08-10 (week 1, 4.7)** — a live prod key on disk is a today-risk independent of revenue; the only known live exposure in the plan does not wait on a revenue milestone. | Google Cloud console | $0 — a key leak after revenue is a breach-notification event, not a bug |
| 9 | Open business checking; start the 30% tax split on payout #1 | Mercury | $0/mo |
| 10 | Refund the runbook verification buys | Stripe Dashboard | ~$2 in kept processing fees per buy |

## Before first $10,000 — compliance checklist

| # | Item | Tool / account | Price |
|---|---|---|---|
| 1 | Form a single-member LLC — in the home state, always (registering elsewhere means paying two states). Filing fees run $35 (Montana) to $500 (Massachusetts); most states $50–$200, plus $0–$500/yr report fees; California adds an $800/yr franchise tax. Decision rule: form it before deadline-shield's first paying customer OR before $10k total revenue, whichever comes first — deadline-shield is the reliance product and carries the portfolio's real tort surface. | Home state Secretary of State site, filed directly (no service markup) | $35–$500 one-time + state annual fee |
| 2 | EIN for the LLC — free, from the IRS only; third-party "EIN filing" sites charge for a free form | irs.gov/ein | $0 |
| 3 | Update Stripe business details and bank account to the LLC | Stripe Dashboard; Mercury | $0 |
| 4 | Start quarterly estimates on schedule | Form 1040-ES via IRS Direct Pay | $0 to pay; the money is the 30% already set aside |
| 5 | deadline-shield go-live legal gate: liability-cap ToS, trial-charge disclosure before card entry, customer-portal cancel link live | deadline-shield repo, docs/go-live-checklist.md — add these as checklist items | $0 |
| 6 | MT charging gate: webhook fulfillment rebuilt AND health-data privacy policy live, in that order, before the first $4.99 | MT repo + Termly Free (second site account) | $0 |
| 7 | One tech E&O insurance quote once deadline-shield has 5 paying customers (a missed-alert claim is its realistic risk) | Hiscox online quote, ~15 minutes | Quote-based — decide with the number in hand, not before |
| 8 | One CPA hour before the first filing season to sanity-check Schedule C + the state registration | Any local CPA | Budget $300 (estimate — actual quote varies) |

## What this screen blocks outright

For every other section, these steps are failed on sight: any pass-guarantee or invented-statistic copy; any charge through MT's current Payment Link; any TraderQ or MFI monetization step; any real-money game mechanic; any LinkedIn automation tool; any email send before checklist items 4 and 5 above; any public post containing revenue figures, customer counts, or architecture; any deadline-shield signup before its ToS gate. Everything else in the plan — the $59 Pass leading the LPs, the magnet-to-email loop, the deadline-shield launch after its gate, the MT rebuild if its gate ever passes — passes as written.

---

# 6. Week-by-week sequence — Mon 2026-08-10 through Fri 2026-10-02

## The shape, and why

Rob Walling's stair-step: start with a simple product on a single free traffic channel, take one-time sales first, then stack small recurring revenue on top. Pieter Levels: keep the day-rhythm, ship something visible every week, post the real numbers. That is the shape. The dates and numbers are Dave's, sized to Dave's actual funnel (the section-2 baseline). There is no hockey stick in this document.

**Two revenue engines, in stair-step order:**

- **Steep ramp (one-time):** CipherExam **$59 Exam Pass** (section 1) — charges the day it's bought.
- **Recurring floor:** CipherExam **Pro $19/mo** (7-day no-card trial) + **deadline-shield Solo $29/mo** (14-day card-required trial — a trial started today is a charge in 14 days).

**Tracks:** `[FUNNEL]` CipherExam funnel · `[SHIELD]` deadline-shield go-live and launch · `[CONTENT]` LinkedIn engine (section 2's calendar is canonical for post dates) · `[GATES]` scoreboard and decision gates.

**Standing weekly rhythm (not restated below):** LinkedIn Mon/Wed/Fri 10:30 MT per the section-2 calendar and drafting process. X reply-only (paused 08-07 decision). No sales calls, cold outreach, or pitches — ever. Monday 9:00 MT: the section-4.4 ritual (which also drafts the scoreboard post). Every Friday 4pm: read Stripe Dashboard live-mode Payments plus `list_users.js` and update the board's N/10 paying-users scoreboard. Dave's own refunded runbook buys never count.

**Do-not-touch list (broken on disk; no step depends on these unless the step is the fix):** MT billing fulfillment (absent), the 4 Firestore push scripts on the dead API-key path (post via the working posts.json path instead), the stale `pk_test` key in the Cipher web .env (server-side redirect checkout doesn't use it; confirm during the Day-0 charge check).

**Day 0 (Fri 08-07 / Sat 08-08), before week 1:** section 1's pipe proofs, section 2's attribution proofs and Saturday batch, section 4's three-defect deploy and MT Payment Link deactivation. Week 1 assumes they happened.

## Week 1 — Mon 08-10 to Fri 08-14: turn on measurement, remove liability, promote what already exists

1. `[GATES]` Monday: surface the real numbers for the first time — the first section-4.4 ritual row. Baselines: live charges since 08-04 (net of refunded runbook buys), users with `billingStatus=paid`, `leadCaptures` count (0, all-time). This closes the board's "surface real activation count" P0.
2. `[FUNNEL]` Confirm Day 0 held: MT Payment Link deactivated, PMP PDF deployed, email runtime proven, `OPENAI_API_KEY` dependency noted. Any miss gets fixed before Wednesday.
3. `[CONTENT]` Tue 08-11: draft magnet post #1 via the lead-magnet pipeline (section 2 drafting slots). Wed 08-12, 10:30 MT: **the first magnet-drop post ever** — PMP cheat sheet → /lp/pmp with UTMs; 10:40 wrapper check. Fri 08-14: SME #3 publishes (finalized by 08-13).
4. `[FUNNEL]` Before Friday: the Proof-1 live-click confirmation — LinkedIn post link tapped on a phone, GA4 records the LP funnel event with UTM intact, capture lands in `leadCaptures`.
5. `[FUNNEL]` By Fri 08-14 (section 4.2/4.7): lead→trial cancel hook deployed; `passExpiryEmail.ts` deployed.
6. `[FUNNEL]` Tue 08-11, blocking magnet post #1: the defect-4 compliance deploy (4.1) — unsubscribe + postal-address footer confirmed in every `onboardingDrip.ts` / `leadMagnetWelcome.ts` template, `emailOptOut` suppression check live in `scheduleOnboardingDrip` and `sendLeadMagnetWelcome`. No stranger receives an automated email before this ships.
7. `[GATES]` Mon 08-10: rotate the factory/phoenix-engine plaintext prod service-account keys (section-5 item 8, dated). By Fri 08-14: dry-run `mt-metrics.mjs` (first execution since 05-28) so the 08-21 MT gate runs on a script proven this week, and verify the Admin-Core "Extend trial" action exists (4.2 — Firestore-console fallback if not).

**Friday 08-14 number:** `leadCaptures` count. Target: **≥3** (all-time before this week: 0).
**Revenue target: $0.** No revenue is planned this week. Any charge is upside.

## Week 2 — Mon 08-17 to Fri 08-21: deadline-shield goes live; MT gate rules

1. `[SHIELD]` Work `docs/go-live-checklist.md` top to bottom in the deadline-shield repo — including the section-5 legal gate items (liability-cap ToS, trial-charge disclosure, portal cancel link) and the two section-3 pricing checks (Solo page count vs ChangeTower's $12/25 pages; limits stated on the pricing page) — and deploy. Then prove **charge settlement**, not just checkout — and name the trap first: deadline-shield's trial is 14-day *card-required*, so a normal live checkout creates a `trialing` subscription with **no settled charge**; there is nothing to refund and no payment webhook event, and "run a checkout and refund it" proves nothing. The explicit test path: for one verification run, set the trial to zero in the create-checkout call (`subscription_data.trial_period_days: 0`, or `trial_end: 'now'` — a one-line change in the deployed create-checkout function) so the subscription invoices immediately → confirm in Stripe live mode that the $29 invoice settled as a real charge, `stripeWebhook` processed the payment event, and access was granted → refund the invoice and cancel the test subscription from the Dashboard → restore the 14-day trial config and redeploy. Separately, run one normal trialing checkout to confirm the trial path also grants access, then cancel it. Both runs complete by **Mon 08-24**, so charge settlement is proven before Show HN sends strangers to this checkout on 08-25. This week is checklist and verification, not construction.
2. `[SHIELD]` Build the no-signup demo page: one public read-only page showing a live watched page and a real detected-change diff. Show HN's guidelines (verified live 08-07) say make it easy to try "without barriers such as signups or emails" — the card-required trial cannot be the front door. Half a day. Create the Hacker News account at news.ycombinator.com now so it isn't hours old on launch day.
3. `[CONTENT]` Per the section-2 calendar: Mon 08-17 scoreboard post #1 (drafted in the ritual), Wed 08-19 SME #4, Fri 08-21 magnet #2 (Sec+ PBQ → /lp/security-plus, link in first comment; drafted Thu 08-20).
4. `[GATES]` **Fri 08-21, MT rebuild-or-sunset gate** (section 4.5): `mt-metrics.mjs`; default **SUNSET** unless ≥25 weekly-active users; revisit only after CipherExam MRR ≥ $500.

**Friday 08-21 number:** cumulative `leadCaptures` (target **≥8**) and CipherExam trials started this week from `list_users.js` (target **≥2**).
**Revenue target: $0 planned.** deadline-shield is live, but its 14-day card trial means the first possible subscription charge lands in week 4 at the earliest.

## Week 3 — Mon 08-24 to Fri 08-28: launch deadline-shield publicly; first charged dollar

1. `[SHIELD]` Tue 08-25: **Show HN** for deadline-shield, linking the no-signup demo. Answer every comment that day. No upvote solicitation — HN's rules forbid it (verified 08-07).
2. `[SHIELD]` Same week: one launch post in r/SideProject from the Reddit account created **Sat 08-08** (section 2, Channel 4 — ~3 weeks old by post day, past most young-account auto-filters; r/SideProject is a launch sub, and the cert-sub no-link warmup rule is separate and holds). Read the sidebar rules first; if self-promo is restricted to a flair or weekly thread, follow that exactly. (Reddit could not be fetch-verified on 08-07; the rules check is part of the step, not optional.) **Fallback if the post is auto-removed anyway:** message the mods once, politely; if it isn't restored within 24 hours, let the 08-25 Show HN carry the week and repost to r/SideProject the following week — never repost same-day against a filter.
3. `[FUNNEL]` Add the validation email to the onboarding drip (`onboardingDrip.ts`), day 2, plain text: "What exam date are you targeting, and what's the one topic you're least sure how to study?" Replies are the board's "validate offer on 5 real PMP candidates" P0 — done by email, zero calls. Count the replies. Reply routing depends on the Day-0 mailbox round-trip (section 1, step 5): send from dave@cipherexam.com only if that test passed; otherwise `reply_to: dquillman2112@gmail.com` — these replies are the 09-04 gate's numerator and must not bounce.
4. `[FUNNEL]` Exam Pass forward, mechanism named: drip Day 3 is a **manual founder email by design** (4.1 — manual until ~50 activated signups/week), so "the Pass into drip day 3" means adding the $59 Pass (one-time, 90 days, 60-day money-back) to the manual Day-3 email's standing talking points — an edit to the founder-email notes, not a new automated send or template; the automated Day-6 pricing email already carries the Pass line from the 08-08 $189-copy fix. LP lead position was verified (or fixed) in the Day-0 first-72-hours check; this week only confirms it held.
5. `[CONTENT]` Per calendar: Mon 08-24 scoreboard #2, Wed 08-26 SME #5, Fri 08-28 magnet #3 (SHRM-CP map → /lp/shrm-cp, winning link format; drafted Thu 08-27). From this week every scoreboard post carries the real funnel counts — ship weekly, show the count, Levels-style, inside the section-5 building-in-public screen.

**Friday 08-28 number:** live Stripe charges, net of refunded runbook buys.
**Revenue target: FIRST CHARGED DOLLAR — 1 × Exam Pass × $59 by Friday 2026-08-28.** Defensible, not guaranteed — and derived only from targets already on record, no invented pool: the plan's own cumulative capture targets are ≥3 by 08-14 and ≥8 by 08-21; if magnet #3's week adds captures at the same ~5/week pace, the drip pool is **~10–13 emails by this Friday** — no larger number exists anywhere in this plan. One $59 buyer from ~10–13 warm drip emails plus 2 launch surfaces is roughly an 8–10% ask of the pool: a stretch stated plainly, not a projection. If the capture targets themselves miss, this target misses with them — that is the honest coupling. If it's $0: week 4 proceeds unchanged — the funnel is 18 days old, and panic pivots are how the last 8 posts earned six D grades.

## Week 4 — Mon 08-31 to Fri 09-04: first list email; probation gate finally evaluated

1. `[FUNNEL]` Tue 09-01: **first broadcast ever to the `leadCaptures` list** — the "PMP Exam v2026" angle: what changed in the 2026 exam, cheat sheet link, one $59 Exam Pass link. One email, one link block, no more. **Mechanism, named:** the automated sequences live in `G:\Users\daveq\Cipher\functions\src\onboardingDrip.ts` and `leadMagnetWelcome.ts`, but they are event-triggered — no broadcast tool exists on disk. So the send is a script: `G:\Users\daveq\Cipher\functions\scripts\send_broadcast.mjs` (~20 lines, written that morning, same shape as `send_exam_pass_note.mjs` from section 1): read every `leadCaptures` document with the same admin credentials `list_users.js` uses; skip any doc with `emailOptOut == true` (the section-1 suppression flag); for each remaining address, POST to `https://api.resend.com/emails` with the existing RESEND_API_KEY — subject, plain-text body, the postal-address footer, and the mailto: unsubscribe line. Run it once, log the send count into the scoreboard row.
2. `[CONTENT]` Per calendar: Mon 08-31 scoreboard #3, Wed 09-02 SME #6, Fri 09-04 magnet #4 (best performer re-run, new hook; drafted Thu 09-03). Magnet rotation returns to PMP — priority cluster #1 stays priority.
3. `[SHIELD]` Answer every HN and Reddit thread still active. Ship one visible improvement from launch feedback and say so in the thread.
4. `[GATES]` **Fri 09-04, CipherExam probation gate, re-armed and actually run.** The board's 07-29 gate (5 real PMP activations or pause) was never evaluated — and the funnel it judged never executed: magnets unpromoted, email dead until 08-06. It runs now, after 4 weeks of real execution: `list_users.js` activated count **≥5 → passed**. Under 5 → CipherExam drops to content-only maintenance (Brad keeps the posting cadence; zero new build hours) and all build hours go to deadline-shield through week 8.

**Friday 09-04 number:** activated PMP users (target **≥5**) and replies to the validation question (target **≥3** of the board's 5).
**Revenue target: cumulative 2 × $59 = $118 one-time. First Pro conversion: 1 × $19/mo. MRR after week 4: $19.**

## Week 5 — Mon 09-07 to Fri 09-11: second channel opens; first recurring dollar

The board's "ONE distribution channel for 30 days" P0 completes; Mon 09-07 is the section-2 30-day review against its four thresholds. Reddit opens as channel #2 per the review's verdict (secondary if LinkedIn scored ≥2, primary if 0–1).

**Authority-track extension calendar — explicit, because the 30-day calendar ends at SME #6 (Wed 09-02) and the 12-post kill gate needs posts #7–12 actually scheduled.** Mondays stay scoreboard posts (the established pattern — no collisions); the magnet slot ended with #4 on 09-04, freeing Wednesdays and Fridays for authority posts. These dates are canonical for posts #7–12:

| Date | Post |
|---|---|
| Mon 09-07 | Scoreboard #4 |
| Wed 09-09 | SME #7 |
| Fri 09-11 | SME #8 |
| Mon 09-14 | Scoreboard #5 |
| Wed 09-16 | SME #9 |
| Fri 09-18 | SME #10 |
| Mon 09-21 | Scoreboard #6 |
| Wed 09-23 | SME #11 |
| Fri 09-25 | SME #12 |

Post #12 publishes Fri 09-25, so the 12-post kill gate — originally penciled for Fri 09-18, a date on which this cadence can only have produced 10 posts — **moves to Mon 09-28**, inside the Monday ritual, where post #12 has 72 hours of data.

1. `[CONTENT]` r/pmp entry, answers only (section 2, Channel 4): sort by New daily, answer with substance, zero links, all week. The account (created 08-08) has a month of age and r/SideProject history. Wed 09-09: Product Hunt launch, prepped 09-08 (section 2, Channel 3).
2. `[SHIELD]` First-charge watch: week-3 card-required trials convert on their 14-day clocks now. **Target: first deadline-shield subscriber charged by Friday 2026-09-11 — 1 × Solo $29/mo.** If trials exist but all cancel, read every cancellation in Stripe Dashboard → Subscriptions before building anything in response.
3. `[FUNNEL]` One LP fix, measured: GA4 funnel events show where /lp/pmp loses the most people (try-a-question events already wired). Fix the single worst step. One change, so next Friday's number attributes cleanly.
4. `[CONTENT]` SME #7 (Wed 09-09) and #8 (Fri 09-11), per the extension calendar above (8 of 12 published by Friday).

**Friday 09-11 number:** deadline-shield active paid subscribers (target **1**).
**Revenue target: cumulative 3 × $59 = $177 one-time. MRR: $19 + $29 = $48.**

## Week 6 — Mon 09-14 to Fri 09-18: guarantee out loud; authority track continues

1. `[CONTENT]` SME #9 (Wed 09-16) and #10 (Fri 09-18), per the week-5 extension calendar. The 12-post kill gate does **not** evaluate this week — only 10 posts exist by Friday; posts #11–12 land 09-23/09-25 and the verdict runs **Mon 09-28** in the ritual (gate calendar), against a bar committed now: (a) any single post ≥500 impressions (2× the all-time best of 238), OR (b) ≥25 total link clicks across the 12 (all-time before the track: 3), OR (c) ≥3 UTM-attributed trial signups. Any one → the track continues. None → fold it, exactly as the track's own kill criterion says, and keep only magnet-drop and scoreboard posts. No relitigating on the day.
2. `[CONTENT]` First r/pmp value post, no link: "I classified 1,000 PMP practice questions by Bloom's level — here's what the 2026 exam actually tests." The Bloom's + Exam Lens IP is the one thing no competitor post can copy. Links only when and where sub rules allow. Tue 09-15: the conditional CipherExam Show HN (section 2) if the logged-out try-a-question condition holds.
3. `[FUNNEL]` Say the guarantee out loud: the 60-day money-back guarantee is already policy — put it next to every $59 and $19 price on the LPs and in the drip. It costs nothing and is the strongest trust asset a zero-testimonial product has (the one usable quote is rescindable and name-restricted; don't lean on it).
4. `[GATES]` Friday: 25-activated check. Expected: still under 25 — the $2/day retargeting budget stays locked. This gate unlocks itself whenever the count crosses 25; no calendar override in either direction.

**Friday 09-18 number:** running authority-track tally at 10 of 12 posts — best-post impressions, total link clicks, attributed signups to date — teed up for the Mon 09-28 verdict.
**Revenue target: cumulative 4 × $59 = $236 one-time. MRR holds at $48 (conversions land next week).**

## Week 7 — Mon 09-21 to Fri 09-25: double what worked, cut what didn't

1. `[GATES]` Monday: rank every post and surface by UTM-attributed LP sessions in GA4, 6 weeks of data. Top mechanism gets two slots this week. Bottom mechanism is cut. Walling's single-channel discipline, applied with numbers instead of taste.
2. `[CONTENT]` If the r/pmp account is in good standing (positive karma, no mod removals), the first direct share: the free PMP cheat sheet, where rules permit. If standing is shaky, stay answers-only another week. Never fight moderators.
3. `[SHIELD]` Numbers follow-up on r/SideProject: "30 days live: N trials, N subscribers, what actually worked." Follow-ups with real numbers outperform launch posts and cost one hour.
4. `[FUNNEL]` Trial-conversion pass: the day-6 drip email (Pro trial ends day 7) gets one plain line — "Keep it: $19/mo" — with a direct checkout link, if it isn't already there.
5. `[CONTENT]` SME #11 (Wed 09-23) and #12 (Fri 09-25) — the track's final two posts, per the week-5 extension calendar, ahead of the Mon 09-28 verdict.

**Friday 09-25 number:** attributed LP sessions per surface (the ranking itself).
**Revenue target: cumulative 5 × $59 = $295 one-time. MRR: 2 × $19 + 1 × $29 = $67.**

## Week 8 — Mon 09-28 to Fri 10-02: the floor

1. `[GATES]` **Mon 09-28: the CipherExam 0-subscription rule (section 4.4) evaluates.** 0 active paid subscriptions on the Monday row → subscription build-hour freeze, Pass-only focus, final call to Friday's read. **Same ritual, Mon 09-28: the 12-post authority-track verdict** (bars committed in week 6; post #12 has 72 hours of data by this read) — continue the track or fold to magnet-drop and scoreboard posts only.
2. `[FUNNEL]` + `[SHIELD]` Convert what's in the pipe: every active trial gets its day-6/day-13 email; one shipped improvement per product, noted publicly.
3. `[CONTENT]` The 8-week numbers post on LinkedIn: the real chart, captures → trials → paid, no adjectives (revenue dollar figures stay off the post — section 5).
4. `[GATES]` **Friday 10-02, full-board read:** N/10 paying-user scoreboard, every gate's state, every section-3 pricing fallback that came due, and the weeks 9–12 decision from the table below.

**Week 8 targets — the arithmetic:**

| Line | Count | Price | Total |
|---|---|---|---|
| CipherExam Pro subscribers | 3 | $19/mo | $57 MRR |
| deadline-shield Solo subscribers | 2 | $29/mo | $58 MRR |
| **MRR floor at 10-02** | | | **$115/mo** |
| Exam Pass sales (cumulative) | 6 | $59 one-time | $354 cash |
| Subscription charges collected by 10-02 | | | ≈ $130 |
| **Total charged by 10-02** | | | **≈ $480** |

Why $115 and not $1,000: the chain is ~11 promotional posts + 2 launch surfaces + 1 new channel on a sub-500-follower base → a defensible ~50–70 captures and ~20–30 trials in 8 weeks; 10–15% trial-to-paid gives 3 Pro subs; 6 one-time Passes from that same pool. Each link of that chain is checked on a named Friday above. $115 MRR from a verified $0 start, with the arithmetic visible, beats a made-up $1,000.

## Weeks 9–12 — standing orders (decided by the 10-02 read)

- **Floor hit ($115 MRR ± anything, ≥5 paying users):** repeat the week 5–8 pattern with the week-7 winners doubled. Next target: 6 × $19 + 4 × $29 = **$230 MRR by Fri 2026-11-27**, plus Exam Pass continuing at ~2/week.
- **Floor missed hard (<$50 MRR and <3 paying users total):** the qcode ops board reconvenes with 8 weeks of clean Friday numbers — its call, not this document's. What it will not be looking at is another quarter of zero attempts: by 10-02 every P0 from 07-07 (email capture, LinkedIn concentration, offer validation, real activation count, one channel for 30 days, N/10 scoreboard) has been executed and measured.

## Gate calendar (all gates already on the board, now dated)

| Date | Gate | Rule |
|---|---|---|
| 08-07 → 09-05 | **Single-channel P0 scope ruling (explicit, on record)** | LinkedIn is CipherExam's only distribution channel for the 30-day window. Three exemptions are granted here explicitly — not implied, not definition-lawyered — and logged in the 08-10 scoreboard row so the board record carries them: (1) the Sat 08-08 one-time directory listings; (2) the 08-24+ Reddit comment-only warmup and the week-3 r/SideProject launch post (deadline-shield's launch, zero CipherExam links); (3) the Tue 08-25 deadline-shield Show HN. If the 08-10 ritual rejects this ruling, the Show HN and r/SideProject post move past 09-05; the directory batch and warmup stand. |
| Fri 08-21 | MT rebuild-or-sunset | Default sunset; rebuild only if mt-metrics.mjs shows ≥25 weekly-active users (script dry-run by Fri 08-14, week 1); revisit at CipherExam MRR ≥ $500 |
| Fri 08-28 | First charged dollar | 1 × $59 Exam Pass; if $0, continue unchanged — evaluate the mechanism at 09-04, not the mission |
| Fri 09-04 | CipherExam probation (re-armed) | ≥5 activated PMP users or drop to content-only maintenance, build hours to deadline-shield |
| Mon 09-07 | 30-day channel review | Section-2 four thresholds; also the section-3 200-LP-session fallback date |
| Fri 09-11 | deadline-shield first subscriber | 1 × $29/mo charged |
| Mon 09-28 | 12-authority-post kill (moved from 09-18 — the cadence only yields 10 posts by then; post #12 publishes Fri 09-25 per the week-5 extension calendar) | ≥500-impression post OR ≥25 clicks OR ≥3 attributed signups, else fold the track |
| Every Fri | 25-activated paid unlock | Self-triggering; unlocks $2/day retargeting cap, nothing more |
| Mon 09-28 | CipherExam 0-subscription rule | 0 active paid subs → subscription build freeze, Pass-only focus (section 4.4) |
| Fri 10-02 | Week-8 floor | $115 MRR / ≈$480 charged / N-of-10 scoreboard / pricing fallbacks due → weeks 9–12 branch |

---

# Tomorrow morning — the first 10 actions, in order

1. Confirm home state; check its DOR for SaaS + print taxability; register there only.
2. Buy the $59 PMP Exam Pass live; verify webhook unlocked PMP; refund it. While on the LPs: confirm the $59 Pass leads above the fold on all three — swap the lead position if it doesn't (first-72-hours checklist).
3. Submit dquillman2112+lptest@gmail.com through /lp/pmp; confirm welcome email and first leadCaptures doc. Round-trip dave@cipherexam.com (Gmail → it → reply back); if inbound fails, set up forwarding same day, and use reply_to dquillman2112@gmail.com until it passes.
4. Run `node scripts\list_users.js` in Cipher functions; record N and billing statuses.
5. Fix $189 copy (onboardingDrip.ts:96, leadMagnetWelcome.ts:158); set TRIAL_DAYS=7; deploy with PMP PDF.
6. Deactivate the Migraine Tracker Payment Link in Stripe Dashboard.
7. Prove `trial_start` fires with linkedin UTMs, desktop and in-app; add Firestore UTM backstop.
8. If N ≥ 1: send the Exam Pass note via send_exam_pass_note.mjs, unsubscribe line included.
9. Draft magnet post #1 via the lead-magnet pipeline; schedule Wed 08-12, 10:30 MT.
10. Saturday batch: LinkedIn Featured/About, Gmail signature, directory kit, Search Console sitemap; create the Reddit account (2 min — it must age before any Reddit post); verify cipherexam.com privacy policy / ToS / written refund policy are live and publish any missing one (Termly Free) before the Wed 08-12 LP push.
