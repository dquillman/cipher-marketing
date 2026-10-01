# LinkedIn bar scan — 2026-10-01

Monthly `cipher-hashtag-bar-scan`. Read in Dave's logged-in Chrome. Every number below was
seen on screen; nothing is inferred. Reactions and comments are the only public figures
LinkedIn exposes for other people's posts — there are no impressions or clicks.

**Prior scan: 2026-09-01.** All month-over-month readings compare against it.

## Scope, stated up front

- **Hashtag: fully re-pulled.** 48 external posts, double last month's 24. Zero dropped for age.
- **Control (Markus Kopko): pulled, NOT comparable.** His 20-card feed is 19 reposts and one
  1-hour-old original. No median can be computed, so the control comparison is skipped.
- **Groups: all six re-read** (front page only).
- **Method change forced by LinkedIn:** the DOM hooks the earlier scans used
  (`.update-components-actor__sub-description`, `data-urn`, `.social-details-social-counts`)
  no longer exist. Everything was read by text extraction, and permalinks were recovered by
  fetching the author's `recent-activity` page source and decoding the activity ids.
  `get_page_text` silently truncates past ~24 posts, so it was not used for the ranking.

---

## 1. The bar — #PMP, 35-day window

| # | Query | Raw cards | New after de-dupe |
|---|---|---|---|
| 1 | `/search/results/content/?keywords=%23PMP&datePosted="past-month"` | 24 | 24 |
| 2 | `/search/results/all/?keywords=%23pmp` (**no date filter**) | 19 | 4 |
| 3 | `/search/results/content/?keywords=%23ProjectManagement PMP exam&datePosted="past-month"` | 24 | 20 |

**Posts dropped for age: 0.** Oldest card in any query was `3w`, including unfiltered query 2.
Query 2 earned its keep this month: both Andrew Whitmire job posts came only from it.

De-duplicated: **48 external posts**, plus Dave's best post at its honest rank = **49**. Six
posts under six hours old showed no reaction count (null, not zero). 43 posts carried a count.

| # | Author | Post | Age | React | Comm | Reposts |
|---|---|---|---|---|---|---|
| 1 | Andrew Whitmire, PMP | It's 2:14 a.m. — 7-Eleven Enterprise PMO PM **job listing** | 2d | 328 | 25 | 20 |
| 2 | Andrew Whitmire, PMP | HOT NOW: PROJECT MANAGERS — Krispy Kreme PM **job listing** | 1w | 152 | 7 | 15 |
| 3 | SOUMYADEEP SEN | I recently passed the PMP exam — tips | 3w | 78 | 15 | 4 |
| 4 | Amer Ali | **Free #pmp!** — comment "PMP" to claim (giveaway) | 6d | 76 | **96** | **38** |
| 5 | Skylar Brown, PMP, MBA | Tomorrow I sit the PMP — imposter syndrome | 3w | 76 | 19 | — |
| 6 | Kaelan Williamson, PMP | 5 years since earning my PMP | 1w | 72 | 6 | — |
| 7 | Skylar Brown, PMP, MBA | The PMP exam is officially done — now the wait | 2w | 71 | 13 | — |
| 8 | Irina Raven | My PMP application was approved — the years I thought didn't count | 1w | 68 | 5 | 2 |
| 9 | Daud Nasir | PMP myths aren't lies, they're outdated advice — **10-page native document** | 2w | 64 | 9 | 9 |
| 10 | Ricardo Coutin PMP | Two new PMPs, two Above Target — trainer card | 1w | 48 | 4 | — |
| 11 | Rachel Portalatin | PMP Bootcamp: complete | 5d | 39 | 5 | — |
| 12 | Nidhi Patel, PMP | Relocating to New Jersey — open to PM roles | 1d | 38 | 6 | 1 |
| 13 | Ghafar Ali CSP, PMP | Earned the PMP — Credly card | 4d | 30 | 28 | — |
| 14 | Shefali Jariwala, PMP | Three and a half months of study — passed Above Target | 1w | 29 | 10 | — |
| 15 | Sajid Mohammed, PMP | My book, The Practical PMP (Amazon link) | 1w | 21 | 9 | 1 |
| 16 | LaToya Robinson | I'm in a PMP program right now | 3w | 20 | 7 | — |
| 17 | AVENEW Group | Congratulations Paulus Januar Banggung, PMP — provider card | 1w | 20 | 3 | — |
| 18 | Jeanne Beirne | Passed Saturday, Above Target in all three — **68% on both mocks** | 1d | 19 | 3 | — |
| 19 | AVENEW Group | Congratulations Cindy Novianty, PMP — provider card | 6d | 19 | 5 | — |
| 20 | Bryan Campbell | A candidate posted on Reddit — article: 5 things | 2w | 18 | 1 | — |
| 21 | Shahid Reza | The exam quietly got harder to wing — **11-page native document** | 3w | 17 | 20 | — |
| 22 | Julie Rice, MBA | In a PMP bootcamp — 40% stakeholder registers | 1w | 14 | 2 | — |
| 23 | Kathleen Moorhead-Paton | What happens in every first session of a prep class | 1w | 13 | 3 | — |
| 24 | AVENEW Group | Congratulations ferri jayagiri, PMP — provider card | 3w | 12 | 1 | — |
| 25 | Amer Ali | Two failed attempts, one more chance (Live replay) | 3d | 11 | 1 | — |
| 26 | Gus Delfin, PMP | From Operations to PM: 7 skills (article) | 1d | 9 | — | — |
| 27 | Aaron McEvers | PMP Bootcamp day one, Coast Guard, Guam | 1w | 8 | 2 | — |
| 28 | Ricardo Coutin PMP | Your lessons learned register may be full and useless (newsletter) | 2w | 8 | 4 | — |
| 29 | Nadeem Mustafa | When did you last update your PMP study plan? (newsletter) | 2w | 8 | — | — |
| 30 | George (Ben) Schenck Jr. | What PMI's experience form asks for — **free helper, link out** | 3d | 7 | 1 | — |
| 31 | Donald Parker, PMP, RMP | Has IT hijacked global project management? (article) | 5d | 7 | 2 | — |
| 32 | Daniel Price, MBA | The more experience you have, the harder the PMP exam | 2d | 7 | 2 | — |
| 33 | Heather Fortlander | 12 years in accounting before anyone called me a PM | 1w | 7 | 1 | — |
| 34 | Etizaz Shah, PMP | Passing isn't about memorizing — 3 lessons | 3w | 7 | 2 | — |
| 35 | Nahir Cramer | First practice exam with zero preparation | 3w | 6 | 2 | — |
| 36 | Alex Atkinson, PMP, ACP | What the updated exam says about the profession | 2d | 5 | 4 | — |
| 37 | Aniket Kulkarni PMP CSM | Green on the dashboard and still in trouble | 3d | 5 | 2 | — |
| 38 | Cornelius Fichtner, PMP | Your employer already paid for 14.5 PDUs — **Udemy link out** | 6d | 5 | 2 | 1 |
| 39 | Kenneth Bainey MBA | Are you studying for the right exam? — **simulator link out** | 2d | 5 | 1 | 1 |
| **40** | **David Quillman (OURS)** | **Sponsor scenario, comment-gated — our only A** | | **4** | **19** | 0 |
| 41 | Benjamin Haikin, PMP | People make projects successful | 2h | 1 | — | — |
| 42 | Malik Jamshed Iqbal | This PMP question looks simple at first | 5h | 1 | — | — |
| 43 | Tomasz Sikorski | The modern PMP exam isn't testing what you can memorize | 2h | 1 | — | — |
| 44 | Gary L Bowling II, PMP | Praise doesn't build confident PMs; lessons learned do | 17h | — | 1 | — |
| 45 | Breena Burgess, MBA, PMP | Thoughtful Thursday — green dashboard (image) | 11h | — | 3 | — |
| 46 | Andrew Ramdayal | Agile topic for the PMP! (video) | 1d | — | 1 | — |
| 47 | Amer Ali | The day he passed PMP, he went back to work | 9m | — | — | — |
| 48 | R. Mikki S. | October 1st — a different kind of confidence (video) | 1h | — | — | — |
| 49 | Vinod Kumar, PMP | PMP Exam Challenge #100 — poll, 10 votes | 6h | — | — | — |

### Where our best post lands

**40th of 49 on reactions (43 counted). 6th of 49 on comments.** Last month: 19th of 25 and
3rd of 25. The comment rank slipped because four external posts carried 20+ comments this month
(96, 28, 25, 20) against one last month.

| | Comments per reaction |
|---|---|
| Ours (`li-thu-2026-08-07-sponsor-scenario`) | **4.75** (19 / 4) |
| Amer Ali — giveaway, comment "PMP" to claim | **1.26** (96 / 76) ← field best |
| Shahid Reza — 11-page document | 1.18 (20 / 17) |
| Ghafar Ali — pass card | 0.93 (28 / 30) |
| Alex Atkinson — exam-change opinion | 0.80 (4 / 5) |
| Field median (n=37 with both counts) | 0.20 |

Field best moved 1.50 → 1.26; field median 0.15 → 0.20. Our lead is still roughly 4x.

### What separates the top-3 from the bottom-3

Top 3 by reactions: Whitmire ×2 (job listings, 328 and 152), SOUMYADEEP SEN (pass + tips, 78).
Bottom 3 with a count: Haikin, Malik, Sikorski at 1 — all under six hours old, so not a
format signal. Bottom 3 that have had time: Fichtner (5), Bainey (5), Schenck (7) — **every one
of them links out** to a course, a simulator, or a helper.

The status-cost mechanic still explains the top: a job listing, a pass, an exam-eve, an
anniversary are all free to react to in a feed recruiters read. Two things sharpened:

1. **Artifact-in-post held at a second scale.** Last month it was one 233-reaction document.
   This month: Daud Nasir's 10-page native document **64 / 9 / 9 reposts**, Shahid Reza's
   11-page document **17 / 20**, against the three link-outs at 5, 5 and 7. Same topic (the
   July exam change), same month, same hashtag. Reposts are the tell again: 9 and 0.
2. **The most comments ever measured in this hashtag is a comment gate.** Amer Ali's "Free
   #pmp" took **96 comments and 38 reposts** on 76 reactions by asking readers to comment one
   word to claim a prize. Our gate asks for a letter and a reason and earns 4.75 per reaction;
   his asks for a word and pays for it. It is the same mechanic with the price of the comment
   driven to zero. Not a shape we would copy — the thread is 96 bare "PMP"s — but it says the
   gate itself is not what suppresses our reactions.

---

## 2. Control — Markus Kopko — NOT COMPARABLE this month

`linkedin.com/in/markuskleinpmp` · **28,330 followers** (28,232 on 2026-09-01, +98)

The activity feed capped at **20 cards: 19 reposts, 1 original.** The original ("PMI did two
things this summer that belong together", 1h old) showed no reaction count and 2 comments.
Two earlier originals were visible only because he reposted them himself:

| His post | Age | React | Comm | Reposts |
|---|---|---|---|---|
| "Most PMs I work with have a folder of good prompts…" | 6d | 8 | 6 | 1 |
| The Standard for AI in Project Management (launch) | 3mo | 121 | 51 | 9 |

That is n=2 with no shared window. **No median is reported and the month-over-month control
comparison is skipped.** The reposts are mostly PMI Prep group posts — including Osaid ur
Rahman's Question #147 (11 / 18), i.e. he is now amplifying the group's worked-question series
rather than running his own. No originals into any group this window.

LinkedIn removed the DOM hooks the earlier pulls relied on; repost cards now expose only the
inner post's age and counts. Treat any future "his median rose/fell" with that in mind.

---

## 3. Groups — all six re-read

Dave's feed median is **0 reactions, best 4**, across 21 posted LinkedIn posts (Firestore).

| Group | Members | Sampled | Dropped (age) | React med / best | Comm med / best | Posts/wk | Spam |
|---|---|---|---|---|---|---|---|
| **PMI Prep** | **256,150** | 11 | 0 | **8 / 114** | **12 / 19** | ~40 | little |
| AI in Project & Business Mgmt (CPMAI) | 1,241 | 9 | 0 | 3 / 6 | 1 / 2 | ~3 | about half |
| Program Management Excellence (PgMP) | 2,618 | 8 | 0 | 1 / 6 | 1 / 1 | ~9 | about half |
| Project Management Excellence (PMP) | 5,271 | 8 | 0 | 1 / 2 | — | ~19 | most |
| PM Career Foundations | 1,884 | 8 | 0 | 1 / 1 | — | ~3 | most |
| Business Analysis Career Community (PMI-PBA) | 2,002 | 6 | **6** | — | — | ~0.3 | about half |

Medians are over posts that displayed a count. PM Career Foundations is 8 of 8 Ahmed Karkary
quote graphics; Project Management Excellence is 5 of 8. PMI-PBA had nothing inside 35 days.

### PMI Prep, second month running

| Post | Author (member, not admin) | React | Comm | Comm/react |
|---|---|---|---|---|
| PMP Exam Practice — Question #147 | Osaid ur Rahman PMP | 11 | **18** | 1.64 |
| PMP Exam Practice — Question (second) | Osaid ur Rahman PMP | 7 | **19** | 2.71 |
| PMP Question #108: most appropriate action | Kathleen Conner, MPA | 11 | **16** | 1.45 |
| Project management teaches a strange kind of instinct | Gabor Stramb | 114 | 8 | 0.07 |

Last month the finding was one member's series at 5 / 12 and 6 / 6. This month three worked
questions by two members each took more comments than any post of ours except the 19-comment
A. **Same recommendation as 2026-09-01, now with a second month of evidence: one calendar slot,
one existing worked scenario, posted into PMI Prep and measured.** It has not been acted on in
30 days.

### What candidates are actually asking (their words)

1. "My full mock scores were 68% — am I ready?" — Jeanne Beirne, who then passed above target.
2. "What should the PM do FIRST / most appropriate action?" — Vinod #100, Conner #108, Rahman #147.
3. "The exam changed in July — is my plan still valid, what is different?" — six posts this
   month (Mustafa, Bainey, Campbell's Reddit candidate, Reza, Nasir, Atkinson).
4. "Does my experience count, and how do I write the experience section?" — Irina Raven (68),
   Schenck, Fortlander, Julie Rice: "I've been managing projects for years, I just didn't call it that."
5. "Experienced PMs answer with what worked, not what PMI says first." — Daniel Price.
6. "Is this even for me?" — Shefali Jariwala (29 / 10), Skylar Brown's exam-eve (76 / 19).

**Coverage gap, unchanged:** PMP-adjacent groups only. No Security+ or SHRM-CP group here.

---

## 4. Queued drafts against the bar

`deadDraftIds: ["li-fri-2026-08-28-magnet-03-shrmcp", "li-fri-2026-09-04-magnet-04-rerun"]`

Both are magnet reruns whose shape is a text post pointing at a link. That shape now has a
second same-month comparison against it: two native documents at 64 and 17 reactions versus
three link-outs at 5, 5 and 7. If either ships, ship it as a native document carousel, not a
link in the first comment.

The other 13 drafts are gated worked scenarios, the mechanic this scan still supports. **But
every one of the 15 carries a scheduled date between 2026-08-24 and 2026-09-25 — all past —
and nothing has posted since 2026-09-17.** The queue is stale as a calendar, not as a shape.

---

## 5. Comment queue

`campaign/commentQueue` is owned by the daily `cipher-comment-scan`, which wrote it at
10:52Z today. It was **read first and merged** via `scripts/push-comment-queue.mjs`.

- **Kept:** both Andrew Ramdayal video items (Q113 at 85 / 18, Q112 at 90 / 17) with transcripts.
- **Added:** Jeanne Beirne (20 / 3, 2d, win post), Vinod Kumar #100 (poll, 7h, quiz register),
  Daniel Price (7 / 2, 3d, discussion with a closing question). All three set to
  "Today — as soon as you can"; Daniel is at the 5-day edge.
- `manual`, `commentedOn`, `baseline` preserved by the script.

Everything rejected is in the document's `excluded` field. Short version: the three PMI Prep
worked questions are the best format targets anywhere this month but sit at 5–6 days and 16–19
comments; Whitmire, Ghafar Ali and the giveaway are over the 20-comment cap; everything with
real numbers in the hashtag is past the 5-day window; three vendors and one PDU ad skipped.

---

## 6. Documents written

- `campaign/hashtagBar` — 49 posts, ours at rank 40, control marked not comparable, six groups.
- `campaign/commentQueue` — merged, 5 live items.
- `site/data/grading-lessons.md` — one bullet appended.
