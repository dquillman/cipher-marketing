# Campaign retro — Tier 1, 2026-05-18 to 2026-08-11

Twelve weeks. Written 2026-08-11 from `site/data/campaign-state.json`, whose
funnel block is filled automatically by `scripts/pull-funnel.mjs` from GA4
property 528695114 scoped to production hostnames. Nothing here is estimated.

## The number the checklist asked for does not exist

The task was "cluster-level activation rates vs. target." There are no rates to
report. Activation is **zero** across all three clusters, and the denominator is
**one signup**. A rate computed on n=1 is not a measurement.

| Stage | Aggregate | PMP | Security+ | SHRM-CP |
|---|---|---|---|---|
| Impressions | 818 | 818 | 0 | 0 |
| LP visits | 7 | 7 | 0 | 0 |
| Signups | 1 | 0 | 0 | 0 |
| Exam picked | 1 | 1 | 0 | 0 |
| **Activated** | **0** | **0** | **0** | **0** |

Targets for reference: activation gate 25, four-week activation target 55,
per-cluster signup targets PMP 30 / Security+ 15 / SHRM-CP 10.

**The campaign did not miss its activation target. It never reached the point
where activation could be measured.** Reporting "0% activation vs a 30% gate"
would imply an onboarding problem we have no evidence for.

## Where it actually breaks

Three arrows, three very different stories:

- **Impressions → LP visits: 0.86%** (7 of 818). This is the break.
- **LP visits → signup: 14.3%** (1 of 7). Healthy-looking on its face, and
  meaningless at n=7. Do not plan against it.
- **Signup → activated: 0%** (0 of 1). Also meaningless at n=1.

And the volume underneath all of it: **818 impressions across 12 weeks is 68 per
week.** That is the entire top of the funnel. Every downstream number is noise
until that changes.

## Two findings that are not in the metrics block

**1. Tier 1 was three clusters on paper and one in practice.** Security+ and
SHRM-CP have **zero impressions** — not low, zero. Their landing pages shipped
2026-05-12 and have been live ever since. Twelve weeks of posting went to PMP.
So we have no read on two thirds of Tier 1, and any "which cluster performs
best" comparison is PMP against two clusters that were never entered.

**2. Killing X was correct and is already reflected here.** The 2026-08-07
decision paused X standalone posts on evidence that every post ever published
landed 2–39 impressions. LinkedIn is the sole channel through 09-05. The 818
figure is what a mostly-LinkedIn cadence produced.

## What this means for the other three checklist items

**"Which Tier 1 cluster gets sustained organic + paid retargeting"** — not
answerable, and the framing hides why. Retargeting needs an audience pool to
retarget; 7 LP visitors is not a pool any ad platform will even build a segment
from. Two of the three candidates have never had a visitor. Choosing between
them now would be choosing on zero evidence and calling it a decision.

**"Whether to start Tier 2 rollout (Network+, Six Sigma GB, CSM SEO)"** — **no.**
Tier 1 has produced one signup and zero activated users. Tier 2 divides the same
68 impressions/week across six clusters instead of three. The one genuine change
since this item was written: the Network+ bank was re-authored on 2026-08-10
against the N10-009 objectives (it had been targeting N10-008, retired since
December 2024), so it is now *product-ready* — but product readiness was never
the constraint. Distribution is.

**"Update cipher-exam-context with real conversion-rate numbers"** — done, and
what got written is the sample size. The skill carried a 10% trial→paid working
target flagged "recalibrate once enough real trials flow through." Enough real
trials have not flowed through. The honest update is to say so, so the 10% is
never mistaken for something observed.

## The one thing worth doing next

Everything above reduces to a single lever: **impressions**. Not activation, not
conversion, not cluster selection, not Tier 2 breadth. At 68/week there is no
statistical surface on which any other decision can be made.

Re-run this retro when aggregate impressions clear ~5,000 or signups clear ~30,
whichever comes first. Below that, cluster-level comparisons are storytelling.

Pull fresh numbers with `node scripts/pull-funnel.mjs` — do not hand-edit the
funnel block.
