# LinkedIn bar scan — 2026-09-01

Monthly `cipher-hashtag-bar-scan`. Read in Dave's logged-in Chrome. Every number below was
seen on screen; nothing is inferred. Reactions and comments are the only public figures
LinkedIn exposes for other people's posts — there are no impressions or clicks.

**Prior scans: 2026-08-30 (24h delta) and 2026-08-29 (the real monthly).** This run compares
against 2026-08-29 wherever a month-over-month reading is claimed.

## Scope decision, stated up front

- **Hashtag: fully re-pulled.** Throttling eased sharply and the sample roughly doubled.
- **Control (Markus Kopko): fully re-pulled.** The window came back like-for-like with
  2026-08-29 (~7 days, feed cap), so the comparison is fair.
- **Groups: 2 of 6 re-measured.** PMI Prep (255,552) and Program Management Excellence
  (2,588) were chosen because they carry the two claims the 2026-08-29 scan rested on.
  The other four are carried forward unchanged and flagged as such in `campaign/hashtagBar`.
  Re-scraping six member-only pages three days apart returns near-identical numbers and
  only adds scraping exposure on the account Dave markets from.

---

## 1. The bar — #PMP, 35-day window

| # | Query | Raw cards | New after de-dupe |
|---|---|---|---|
| 1 | `/search/results/content/?keywords=%23PMP&datePosted="past-month"` | 12 | 12 |
| 2 | `/search/results/all/?keywords=%23pmp` (**no date filter**) | 9 | **0** |
| 3 | `/search/results/content/?keywords=%23ProjectManagement PMP exam&datePosted="past-month"` | 12 | 12 |

**Posts dropped for age: 0.** Oldest card in any query was `3w`, including in query 2,
which carries no date filter. Query 2 returned nothing query 1 had not already surfaced —
worth recording, because it is the query kept specifically for extra coverage.

De-duplicated: **24 external posts**, plus Dave's best post at its honest rank = **25**.
That is more than double the 2026-08-30 run (11) and above the 2026-08-29 run (19). This
is still the reachable set under throttling, not a true top-25 of the hashtag.

| # | Author | Post | Age | React | Comm |
|---|---|---|---|---|---|
| 1 | Andrew Whitmire, PMP | Museum of Ice Cream wants a Senior PM — PMP required | 1w | 466 | 63 |
| 2 | Ahmed Ezzat | PMP Course Summary, **43 pages posted in full as a document** | 2d | 233 | 17 |
| 3 | Alece Coleman LCSW, PMP | Passed above target on 7/30 — here's my take on the new exam | 3w | 199 | 30 |
| 4 | Silvia Zamora, PMP | I did it. I'm officially a PMP — after failing in July | 1d | 174 | 17 |
| 5 | Derek B. | Are you eyeing another or first PM certification? | 1d | 45 | 10 |
| 6 | Andrew Ramdayal | Helping Someone Cheat on PMP? (video) | 5d | 38 | 2 |
| 7 | Hemant Dhariyal | The PMP exam has changed — our Sept 12 cohort is redesigned | 5d | 33 | 4 |
| 8 | Andrew Ramdayal | Hardest topic on the PMP! (video) | 21h | 30 | 1 |
| 9 | Jessica Mcclain | Back into PMP prep mode — what helped you most? | 3w | 24 | 7 |
| 10 | Lizzy Purcell | Hiring: Project Manager, US or Canada | 1w | 23 | 4 |
| 11 | Jacki Miller, PHR | Experienced PM wanted, Raleigh/Durham | 6d | 17 | 3 |
| 12 | Jay D. Voigt, CPP, PMP | From local coverage to the national stage — drone program | 6d | 12 | 6 |
| 13 | Vinod Kumar, PMP | PMP Exam Challenge #68 — poll | 1w | 11 | 3 |
| 14 | Georgjeanna (Gina) Plummer | What the 2026 exam change means for the profession | 2w | 11 | 1 |
| 15 | Kara Oliver | **PMP or Scrum Master — which brings more value?** | 1w | 10 | **15** |
| 16 | Bryan Campbell | The PMP exam changed more than the question weights | 2w | 9 | 1 |
| 17 | PreparationInfo | 50 PMP exam traps — **teaser, list behind a newsletter** | 3w | 7 | — |
| 18 | Mike Gustin | Cleared Project Manager wanted for an upcoming bid | 5d | 6 | 1 |
| **19** | **David Quillman (OURS)** | **Sponsor scenario, comment-gated — our only A** | | **4** | **19** |
| 20 | James Clingerman | Sharing a PMO director opportunity | 23h | 3 | — |
| 21 | Vibhor Sharma | Hiring: PM, Security Services, Dallas | 22h | 3 | — |
| 22 | Sheetal Rana | WE'RE HIRING — Enterprise PM, South Carolina | 32m | 2 | 1 |
| 23 | Markus Kopko | **Worked answer reveal + full ECO mapping — our format** | 2w | 1 | — |
| 24 | Scholaracad | PMP Exam Changes July 2026 — **link out to their own site** | 3w | 1 | 1 |
| 25 | Vinod Kumar, PMP | PMP Exam Challenge #73 — poll open, no counts yet | 7h | — | — |

### Where our best post lands

**19th of 25 on reactions. 3rd of 25 on comments.** The same split as the last three scans,
now at more than double the sample. On comments per reaction:

| | Comments per reaction |
|---|---|
| Ours (`li-thu-2026-08-07-sponsor-scenario`) | **4.75** (19 / 4) |
| Kara Oliver — open question | **1.50** (15 / 10) ← new field best |
| Jay D. Voigt | 0.50 (6 / 12) |
| Jessica Mcclain | 0.29 (7 / 24) |
| Derek B. | 0.22 (10 / 45) |
| Alece Coleman | 0.15 (30 / 199) |
| Andrew Whitmire | 0.14 (63 / 466) |
| Silvia Zamora | 0.10 (17 / 174) |
| Ahmed Ezzat | 0.07 (17 / 233) |

**The field best moved 0.50 → 1.50.** Our lead narrowed from roughly 9x to roughly 3x, and
the post that closed it is an open question — the same status transaction the 2026-08-29
Diedra Grant finding already named.

### What separates the top-3 from the bottom-3

Top 3: Whitmire (466), **Ahmed Ezzat (233)**, Alece Coleman (199).
Bottom 3 (counted posts): Sheetal Rana (2), **Markus Kopko (1)**, **Scholaracad (1)**.

The status-cost mechanic still explains the bottom. It does **not** explain #2, and that
is the month's real finding. A prep resource — the exact category the model says must sit
at the bottom — took 233 reactions and **23 reposts**.

The controlled comparison is inside this same sample, same topic, same month:

| Post | Delivery | React |
|---|---|---|
| Ahmed Ezzat, PMP Course Summary | **43-page native LinkedIn document, in-feed, no gate, no ask** | **233** |
| PreparationInfo, 50 PMP Exam Traps | teaser + newsletter subscribe | 7 |
| Scholaracad, PMP Exam Changes July 2026 | link out to their own site | 1 |

**233x and 33x.** The separator is not teach-versus-celebrate — it is whether the reader
gets the whole thing where they are already standing. Ezzat even undercuts his own
credibility in the copy (the summary is built on the pre-July ECO, and he says so) and it
cost him nothing. Reposts are the tell: 23, against 0 on anything of ours, ever.

And the bottom of the table is Markus Kopko's worked answer-reveal with full ECO mapping —
our exact format, run with 28,232 followers, at **1 reaction**.

---

## 2. Control — Markus Kopko

`linkedin.com/in/markuskleinpmp` · **28,232 followers** (28,208 on 2026-08-29, +24)

**Window is like-for-like this time.** The activity feed capped at **14 cards, oldest `1w`**,
against 20 cards and `1w` on 2026-08-29. Same ~7-day span, fewer cards. `get_page_text`
failed on this page as documented; the feed was extracted by `javascript_tool` DOM reads.

| | 2026-08-29 | 2026-09-01 |
|---|---|---|
| Originals in window | 10 | 6 |
| Reposts in window | 8 | 8 |
| Reactions median / best | 2 / 3 | **5 / 13** |
| Comments median / best | 1 / 2 | **3 / 7** |

**The rise is one post, not a format effect.** His 13/6 top post is a **product launch** —
"Most candidates who fail the PMP never had a knowledge problem", fronting *PM Master Quest
2026*, a 30-day one-scenario-a-day program starting today. The posts that actually run our
format sit where they always have:

| His post | React | Comm | Comm/react |
|---|---|---|---|
| PMP-Challenge #036 | 5 | 2 | 0.40 |
| CPMAI-Challenge #030 | 5 | 7 | 1.40 |
| Group scenario share | 1 | 2 | 2.00 |
| Worked answer reveal + ECO map (found in the hashtag pull) | 1 | — | — |
| **Ours** | **4** | **19** | **4.75** |

**The authority explanation still fails.** A PMI AI Standards Core Team credential and
28,232 followers buy a median of 5 reactions on this format. He posts into Groups as an
admin — two in this window, at 1/2 and 2/3 — and they still do not out-earn his own feed.

---

## 3. Groups — 2 re-measured, 4 carried forward

| Group | Members | Sampled | Dropped (age) | React med / best | Comm med / best | Posts/wk | Spam |
|---|---|---|---|---|---|---|---|
| **Project Management Institute (PMI) Prep** | **255,552** | 10 | 0 | **5 / 19** | **2 / 12** | ~70 | **little** |
| Business Analysis Career Community (PMI-PBA) † | 1,991 | 8 | 6 | 3.5 / 4 | 2 / 3 | 0.4 | little |
| AI in Project & Business Mgmt (PMI-CPMAI) † | 1,200 | 8 | 0 | 3 / 5 | 1 / 13 | 8 | little |
| **Program Management Excellence (PgMP)** | 2,588 | 8 | 0 | 2 / 5 | 0.5 / 14 | 8 | about half |
| PM Career Foundations † | 1,882 | 8 | 0 | 1 / 5 | 0 / 4 | 8 | little |
| Project Management Excellence (PMP) † | 5,234 | 9 | 0 | 1 / 2 | 0 / 0 | 21 | about half |

† **NOT re-measured** — figures carried forward from 2026-08-29.

### Does any group beat Dave's own feed median?

Dave's feed median is **0 reactions, best 4**, across 11 measured LinkedIn posts. Last
month's answer was "technically all six, and that fact is worthless — everything sits in
the same 0–4 band." **That is no longer true of PMI Prep.** Its *median* of 5 now beats
Dave's best post ever, and its best of 19 is nearly 5x it.

**And the caveat that made last month's group finding unusable is gone.** The 2026-08-29
lesson closed by noting the only rooms that worked were driven by Markus Kopko posting as
their **admin** — a distribution privilege Dave does not have. This month, four of the ten
PMI Prep posts are a numbered worked-question series (**#34, #159, #225, #353**) run by
**Kathleen Conner, a member, not an admin**:

| Her post | React | Comm | Comm/react |
|---|---|---|---|
| PMP Question #34 (tailoring) | 5 | 12 | **2.40** |
| PMP Question #353 (resource conflict) | 6 | 6 | **1.00** |
| PMP Question #225 (initial step) | 1 | 1 | 1.00 |
| PMP Question #159 (most appropriate action) | — | — | — |

Against the group admin's own scenario posts in the same window at 3 and 2 comments. Our
exact mechanic, run by a stranger with no audience and no moderator privilege, out-earning
a 28,232-follower PMI credential.

Program Management Excellence is unchanged and confirms the prior: median 2 / best 5
reactions, median 0.5 / best 14 comments — and the 14 is still the *same* admin
PgMP-Challenge post measured last month, now 5 days old.

**Recommendation: one calendar slot, one existing worked scenario, posted into PMI Prep and
measured.** Not a channel switch. Two front-page snapshots three days apart is an
observation, not a trend, and the group is member-only so nothing here is verifiable
outside Dave's session.

### What candidates are actually asking

1. **"The exam changed in July 2026 — is my material still valid, and what is different?"**
   Still the strongest topic in the data, and now on **five** separate posts in one month:
   Bryan Campbell, Hemant Dhariyal, Gina Plummer, Scholaracad, and Ahmed Ezzat — who flags
   his own 233-reaction summary as pre-July and tells readers to work out what changed.
2. **"The PMP tests a stakeholder escalation in theory; real life tests it differently."**
   Meni Dalal, PMI Prep, `#QuestionForGroup`. This is our own thesis in a candidate's words.
3. **"What should the PM do FIRST / what is the most effective initial step?"** The recurring
   *shape* of everything candidates trade in PMI Prep — all four of Kathleen Conner's items
   are FIRST/NEXT/initial-step questions, matching the sequence-not-knowledge framing.
4. **"PMP or Scrum Master — which brings more value?"** Kara Oliver, 10 / 15.
5. **"Which certification next, or first?"** Derek B., 45 / 10.
6. **"What resource or study approach helped you most?"** Jessica Mcclain, 24 / 7.

**Coverage gap, unchanged:** Dave is in PMP-adjacent groups only. No Security+ or SHRM-CP
group exists here, so this whole section speaks for one exam cluster of three.

---

## 4. Queued drafts against the bar

`deadDraftIds: ["li-fri-2026-08-28-magnet-03-shrmcp"]`

Its planNote reads *"Magnet link moves to the first comment"* — the one shape with a
same-month 233-to-1 comparison against it. Our own two magnet posts are the control and
they agree: `li-fri-2026-08-14-pmp-lens-magnet` (link in first comment) took 0 reactions /
1 comment / 8 clicks / **0 signups**; `li-fri-2026-08-21-magnet-02-secplus` (full answer
written into the first comment, no gate) took 2 / 1 / 8 clicks / **0 signups**. Near
identical — so *gating* is not what is killing them either. Both are text posts pointing
elsewhere. The untested variable is the **native document carousel**.

**Removed from the list:** `li-wed-2026-08-26-llm-compare`, the prior sole entry. It is no
longer a draft — it published 2026-09-01 01:26Z.

**No other offenders.** The remaining 14 drafts are gated worked scenarios, the mechanic
this scan again supports (4.75 comments per reaction against a field best of 1.50).

---

## 5. Comment queue

`campaign/commentQueue` is owned by the daily `cipher-comment-scan` (05:30), which wrote it
at **2026-09-01T10:45Z**, about 7½ hours before this run. It was **read first and merged,
not overwritten**, via `scripts/push-comment-queue.mjs`.

- **Carried forward:** Andrew Ramdayal, 23 reactions / **0 comments** — the daily scan's
  best find and still unanswered.
- **Dropped automatically** (already answered, recorded in `commentedOn`): Ramdayal 92/11,
  Abitha William 5/2.
- **Added from this scan:** Ahmed Ezzat (233 / 17, 2d) and Silvia Zamora (174 / 17, 1d).
  Both are large live rooms well under the 20-comment cap — the two best targets any bar
  scan has produced.

`manual`, `commentedOn` (9 entries) and `baseline` all preserved by the script.

Everything rejected is written into the document's `excluded` field so the next run does
not re-derive it. The short version: Whitmire is at 63 comments (buried); Alece Coleman,
Jessica Mcclain, Kara Oliver, Vinod #68, Bryan Campbell and Gina Plummer are all past the
5-day window; both Ramdayal hashtag posts are video; Vinod's Challenge #73 is the right
shape but his rooms run 1–11 reactions; Hemant Dhariyal is a cohort sales post; six job
listings and one drone-program post are not exam content.

---

## 6. Documents written

- `campaign/hashtagBar` — written and read back, 25 posts, ours at rank 19, control
  re-measured, groups partially re-measured.
- `campaign/commentQueue` — merged, 3 live items.
- `site/data/grading-lessons.md` — two bullets appended (the artifact-in-post finding, and
  the PMI Prep reversal with the two stale numbers it corrects).
