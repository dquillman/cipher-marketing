# 15 — Manual Activation Sprint (0 → 5 → 25)

> **Created 2026-05-28.** The board's unanimous next move: stop building, hand-recruit real candidates, and prove activation on ~5 people before spending any energy scaling traffic. This is the runbook for that. PMP-only (priority #1).

## Why this, why now

- **Day 11 of launch. 0 activated users, 0 trial signups, 0 paid spend.** Funnel is all zeros — the leak is the *top*: almost nothing is entering.
- The product is finished and instrumented. The missing thing is **proof that a real human gets value and comes back.** You can't learn that from a dashboard at 0; you learn it from 5 people you watched go through it.
- Paid is gated until 25 activated users (and capped at $2/day anyway). So the only lever right now is **manual, founder-led recruiting.**

## Definitions (don't blur these)

| Term | Means |
|---|---|
| **Signup** | Finished trial registration |
| **Activated** | Signup **+ picked an exam + answered 10 questions** ← the real KPI |
| **Retained (the real eval)** | Came back on **day 2** AND/OR answered question 11 better than question 1 |

Activation is the gate metric. **Retention is the proof.** A user who activates and never returns is not validation.

## The target

- **This sprint (2 weeks): 5 activated PMP users**, recruited by hand, each watched/followed-up personally.
- Gate: **25 activated** unlocks $2/day retargeting. 4-week target: 55 (PMP 30 / Sec+ 15 / SHRM-CP 10).
- If 15 hand-recruited candidates → fewer than ~5 activate, **stop recruiting and fix the activation flow** — that's the finding, and it's cheap to learn now.

## The one rule that governs every message

**Lead with the free, no-signup demo — never the trial.** The Try-a-Question widget on `/lp/pmp` lets anyone answer real PMP questions and see the Exam Lens explanation with zero commitment. That's the hook. The trial is the *downstream* upsell after they've felt the value.

Guardrails (from `cipher-exam-context`):
- ❌ Never "guaranteed pass" / "pass or refund the exam." Describe what the product *shows* them ("see exactly how PMP wants you to reason"), never promise the outcome.
- ❌ No fake urgency / scarcity / invented stats.
- ✅ Credibility comes from the Exam Lens mechanism + the founder story. A PMI AI Standards Core Team member beta-tested it — you may reference that credential in 1:1 outreach; keep it credential-first, not name-led.
- ✅ Plain-spoken, helpful-first, founder voice ("I built this because…").

## Where to recruit (PMP)

From `campaign-state.json → communityEngagement.byExam.PMP`:

- **Reddit:** r/pmp, r/projectmanagement
- **LinkedIn:** #PMP feed, PMP study groups (pin a specific group URL)
- **Facebook:** PMP Exam Prep / PMP Question Bank groups (verify exact URLs)
- **X:** #PMP live, @PMInstitute orbit

Daily target: **3 genuinely helpful interactions per platform** (answer first, pitch maybe). Quality over volume — one person you actually help > ten cold drops.

---

## Outreach templates

### A. Reddit/forum "help-first" comment (the workhorse)
> Find a post where someone's stuck on a PMP question or confused about *why* an answer is right. Answer their actual question well. Then, only if it fits:

```
The thing that finally clicked for me on questions like this: PMP isn't testing
what you'd do, it's testing what PMI thinks a PM should do — almost always the
proactive / communicate-first option. If it helps, I built a free tool that
shows the reasoning behind each answer (no signup): cipherexam.com/lp/pmp — try
a few and tell me if the explanations actually help, I'm tuning them.
```
*No hard CTA. You're asking for feedback, not a signup. That's what earns the click.*

### B. DM after a good interaction
```
Hey — saw you're prepping for the PMP. I'm a solo founder building a prep tool
that focuses on the *reasoning* behind questions instead of rote memorization.
Would you be up for trying it free and telling me where it's confusing? Genuinely
want a few sharp testers more than I want customers right now. No pressure either way.
```

### C. The "free Pro for honest feedback" offer (for warm candidates)
```
I'll turn on full Pro access for you, free — all I want back is 10 minutes of
"here's what was confusing / here's what clicked." If it's useful, great; if it's
not, that's the most valuable thing you could tell me. Want in?
```

### D. Founder follow-ups (tie to `07-founder-1to1-emails.md`)
- **Day 0 (on signup):** welcome + "pick your exam and try 10 questions, then tell me the one that annoyed you most."
- **Day 2 (the retention nudge):** "Did the explanations make sense? Here's the one domain your answers suggest you should hit next." ← this message is the day-2 return lever.

---

## The tracker

Update daily. The goal is 5 rows reaching **Activated = yes** and as many as possible reaching **Day-2 return = yes**.

| # | Candidate (handle/first name) | Source | Contacted | Signed up | Exam picked | Q answered | Activated (≥10Q) | Day-2 return | Notes / what confused them |
|---|---|---|---|---|---|---|---|---|---|
| 1 |  |  |  |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |  |  |
| 4 |  |  |  |  |  |  |  |  |  |
| 5 |  |  |  |  |  |  |  |  |  |
| 6 |  |  |  |  |  |  |  |  |  |
| 7 |  |  |  |  |  |  |  |  |  |
| 8 |  |  |  |  |  |  |  |  |  |
| 9 |  |  |  |  |  |  |  |  |  |
| 10 |  |  |  |  |  |  |  |  |  |
| 11 |  |  |  |  |  |  |  |  |  |
| 12 |  |  |  |  |  |  |  |  |  |
| 13 |  |  |  |  |  |  |  |  |  |
| 14 |  |  |  |  |  |  |  |  |  |
| 15 |  |  |  |  |  |  |  |  |  |

**Running totals:** contacted __ · signed up __ · activated __ / 5 · day-2 returned __

## Daily ritual (15 min)

1. 3 helpful interactions per platform (template A). Log anyone who engages into the tracker.
2. Send template B/C to anyone warm from yesterday.
3. Send Day-0 / Day-2 founder notes (template D) to new signups, matched to days-since-signup.
4. Update the tracker totals **and** mirror `activatedUsersTotal` / `trialSignupsTotal` into `site/data/campaign-state.json` so `funnel.html` reflects reality.
5. **The "why" column is the gold.** Every "this confused me" is a fix that lifts activation for the next person — feed real ones to `grading-lessons.md` or a product fix.

## What success / failure looks like

- **Success:** ≥5 activate and ≥3 come back on day 2. → You've earned the right to scale a channel. Re-run the board on "which channel," now with real retention data.
- **Failure mode 1 — they sign up but don't reach 10 questions:** the onboarding/first-session is the leak. Watch a Clarity recording; fix time-to-first-value.
- **Failure mode 2 — they activate but don't return day 2:** the *value* isn't landing. That's a product/positioning problem, not a traffic problem — and far cheaper to learn now than after a traffic push.

## Guardrail reminder

This sprint generates testimonials too. If anyone offers praise, capture it (the in-app Q10 prompt already does), but apply the `cipher-exam-context` testimonial rules — especially **name-removed / institutional-credential-only on any PMP (PMI) surface.**
