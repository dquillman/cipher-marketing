# LinkedIn bar scan — 2026-08-30

`cipher-hashtag-bar-scan`. Read in Dave's logged-in Chrome. Every number below was seen on
screen; nothing is inferred. Reactions and comments are the only public figures LinkedIn
exposes for other people's posts — there are no impressions or clicks.

**Prior scan: 2026-08-29 — ONE DAY earlier.** This is a 24-hour delta, not a
month-over-month one. Nothing below may be read as a trend. Yesterday's corpus is kept
intact at [`linkedin-bar.md`](linkedin-bar.md) and is still the file next month's run
should compare against.

## Scope decision, stated up front

Re-scraping the Markus Kopko control and the six groups 24 hours after they were measured
would return the same numbers and buy only more scraping exposure on the account Dave
markets from. Both blocks were **carried forward unchanged** in `campaign/hashtagBar`,
each keeping its own `scannedAt` of `2026-08-29T18:09:12Z`, with a "NOT RE-MEASURED"
line prepended so the dashboard panel cannot mislead. Only the hashtag was re-pulled.

---

## 1. The bar — #PMP, 35-day window

| # | Query | Raw cards |
|---|---|---|
| 1 | `/search/results/content/?keywords=%23PMP&datePosted="past-month"` | 3 |
| 2 | `/search/results/all/?keywords=%23pmp` (no date filter) | 9 |
| 3 | `/search/results/content/?keywords=%23ProjectManagement PMP exam&datePosted="past-month"` | 3 |

**Throttling was markedly worse than yesterday** (9 + 11 + 9 → 3 + 9 + 3). Each page was
scrolled to exhaustion — `document.body.innerText.length` stopped growing — before reading.
The reachable set fell from 20 posts to 12. That is a sampling artefact of hitting the same
three queries 24h apart, not evidence the hashtag went quiet.

**Posts dropped for age: 0.** Oldest card in any query was `1w`, including in query 2,
which carries no date filter.

De-duplicated: **11 external posts**, plus Dave's best post at its honest rank = **12**.

| # | Author | Post | Age | React | Comm |
|---|---|---|---|---|---|
| 1 | Andrew Whitmire, PMP | Museum of Ice Cream wants a Senior PM — PMP required | 6d | 463 | 64 |
| 2 | Meghna Kalvi | "I took an exam to prove I know how to manage projects" — PMP pass | 5d | 138 | 36 |
| 3 | Andrew Ramdayal | Helping Someone Cheat on PMP? (video) | 4d | 36 | 2 |
| 4 | Andrew Ramdayal | You're Studying PMP All Wrong (video) | 6d | 32 | 1 |
| 5 | Hemant Dhariyal | The PMP exam has changed — our Sept 12 cohort is redesigned | 4d | 31 | 4 |
| 6 | Jacki Miller, PHR | We're looking for an experienced PM in Raleigh/Durham | 5d | 17 | 3 |
| 7 | Colleen E. Lofton, EdD, PMP | Contemplating a PMP? Three questions to ask first | 1w | 12 | 3 |
| 8 | Jay D. Voigt, CPP, PMP | From local coverage to the national stage — drone program | 4d | 12 | 6 |
| 9 | Vinod Kumar, PMP | PMP Exam Challenge #68 — poll, vote then give your reasoning | 6d | 11 | 3 |
| 10 | Ernest Ambrose, PMP | I'm officially #OpenToWork — TPM / Engineering Ops | 6d | 8 | 1 |
| 11 | Mike Gustin | Cleared Project Manager wanted for an upcoming bid | 3d | 6 | 1 |
| **12** | **David Quillman (OURS)** | **Sponsor scenario, comment-gated — our only A** | | **4** | **19** |

Robert Roskam's card ("Ernie is amazing!") is a reshare of Ernest Ambrose's post and is not
counted separately — the visible counts belong to the inner post.

### Where our best post lands

**12th of 12 on reactions. 3rd of 12 on comments.** Same split as the last two scans.
On comments per reaction it is not close:

| | Comments per reaction |
|---|---|
| Ours (`li-thu-2026-08-07-sponsor-scenario`) | **4.75** (19 / 4) |
| Jay D. Voigt | 0.50 (6 / 12) |
| Meghna Kalvi | 0.26 (36 / 138) |
| Andrew Whitmire | 0.14 (64 / 463) |

### What separates the top from the bottom

The status-cost mechanic holds and the mechanism is unchanged: **a reaction that raises
the reader's standing is free; one that admits a gap is not.** The two rooms an order of
magnitude above everything else are a dream job listing (463) and a peer's exam pass (138).
Liking either says "I belong in this field". Everything that teaches, tests or sells prep
sits at 6–36 — including both Andrew Ramdayal videos (36, 32) despite 900,000+ students.

**One thing genuinely changed in 24h:** an exam-pass announcement re-entered the sample at
#2. Yesterday's scan recorded that no pass announcement surfaced at all and read the
hashtag as having flipped to job supply. One day later the shape is back and second. That
is a warning about the 2026-08-29 conclusion, not a new trend: at these sample sizes a
single post moves the story.

---

## 2. Our own feed

> **CORRECTED 2026-09-01.** The first version of this section claimed the three frame-test
> posts were untracked and could never be graded. **That was wrong.** It was read off the
> LOCAL `site/data/posts.json`, which is a mirror, not the source of truth. Firestore
> already held all three as `posted` and graded **C** — 302 / 90 / 70 impressions — and
> `li-frame-test-01` had already been regraded at 7d (commit `1fad696`). The local mirror
> was stale and has been resynced with `seed-firestore.mjs --pull`. Two real defects
> survive the correction, and they are below.

Read from `/in/me/recent-activity/all/` and from each permalink directly.

### Defect 1 — `li-frame-test-01` is live TWICE

| urn | Posted (UTC) | Age | React | Comm | Tracked? |
|---|---|---|---|---|---|
| `7497818910742884352` | 2026-08-25 00:55 | 1w | 0 | 1 | **yes** — graded C, 302 impressions |
| `7498045383969820673` | 2026-08-25 15:55 | 6d | 0 | 1 | **no** |

Same copy, 15 hours apart, **both still up**. Frame A's audience is split across two posts
and only one of them is measured. **Frame A's 302 impressions are therefore an undercount,
and the three-way frame comparison is not valid until this is resolved.** Deleting a live
post is Dave's call, not the scan's — nothing was removed.

### Defect 2 — two posts published by hand, in no data store at all

| Posted (CT) | Opening | React | Comm | Now recorded as |
|---|---|---|---|---|
| 2026-08-30 14:00 | "Unpopular opinion about certification prep: 'I did 2,000 practice questions'…" | 1 | 0 | `li-volume-metric` |
| 2026-08-30 10:55 | "Nobody has ever been promoted for remembering a definition." | 0 | 0 | `li-cognitive-levels` |

Both are now in `posts.json` and Firestore as `posted`, with `postedAt` **derived from the
activity urn** rather than stamped at recovery time — `mark-published.mjs` stamps `now`,
which would have pushed both back behind the grader's 48-hour floor and delayed grading by
two days for no reason.

Two things to fix before either shape is reused:

- Both carry a **bare `cipherexam.com`** with no scheme and no UTM. GA4 cannot attribute
  anything they earn, so their real contribution is unmeasurable.
- `li-cognitive-levels` names the product **"CIPHER"**, not CipherExam.

### The reading that survives

Across all five live posts and all three frames: **zero reactions**, except a single
reaction on `li-volume-metric`. Frames A/B/C took 1, 2 and 1 comments. The frames are not
separable on reactions because none of them moved, and frame A's reach figure is
compromised by the duplicate. **If the frame test is to decide anything it has to be on
GA4 signups by UTM** — which the two hand-posted posts cannot contribute to at all.

Also live and now tracked: `li-wed-2026-08-26-llm-compare` went up 2026-09-01 01:26Z
(1 reaction, 1 comment at 12h) — the post this scan lists in `deadDraftIds`.

Permalinks for everything above are in the tables.

---

## 3. Control and Groups — carried forward, not re-measured

Both were measured 2026-08-29. See [`linkedin-bar.md`](linkedin-bar.md) §2 and §3 for the
full figures. Nothing in them is restated here, because restating a 24-hour-old
measurement as a fresh one is exactly the error this scan is written to avoid.

The two results that still stand and still matter:

- Markus Kopko, 28,208 followers and a PMI AI Standards credential, runs a **median of 2
  reactions** on our format. Authority is not what is holding us back.
- No group beats Dave's feed in any way worth a calendar slot — all six groups and his
  feed sit in the same 0–4 reaction band — but the two smallest rooms (2,588 and 1,200
  members) produced the highest comment counts anywhere in the data (14 and 13), both from
  a numbered worked scenario posted by the group admin.

---

## 4. Queued drafts against the bar

`deadDraftIds: ["li-wed-2026-08-26-llm-compare"]` — unchanged. That product-comparison post
is the only queued draft on a shape with no support in the data; every tooling/product post
across both scans sits at 1–3 reactions.

No new offenders. Nothing in this sample contradicts the gated-scenario mechanic, which
still produces 4.75 comments per reaction against a field best of 0.50.

---

## 5. Comment queue — deliberately NOT rewritten

`campaign/commentQueue` was written by the daily `cipher-comment-scan` at
**2026-08-30T15:20:24Z**, about three hours before this run, and it holds two targets that
are better than anything this scan surfaced:

- Dr. Charlene P. — 50 reactions / **2** comments at 1.7 days
- Andrew Ramdayal — 70 reactions / **9** comments at 21 hours

Every candidate from today's hashtag pull fails at least one of the three rules:

| Candidate | React / Comm | Rejected because |
|---|---|---|
| Andrew Whitmire | 463 / 64 | 64 comments — buried on arrival, over the 20 cap |
| Meghna Kalvi | 138 / 36 | 36 comments — over the cap |
| Andrew Ramdayal (both) | 36 / 2, 32 / 1 | video, cannot be pre-drafted; and the daily scan already holds a fresher Ramdayal target at 21h |
| Hemant Dhariyal | 31 / 4 | a cohort sales post; a comment there is arguing with a seller |
| Vinod Kumar poll | 11 / 3 | 6d — past the 5-day dead-room window |
| Colleen E. Lofton | 12 / 3 | 1w — past the window |
| Jay D. Voigt | 12 / 6 | drone program, not exam prep; nothing true to add |
| Mike Gustin | 6 / 1 | job post, nothing true to add |

So the document was left exactly as the daily scan wrote it. Overwriting it would have
repeated the 2026-08-29 failure this task's own instructions record.

---

## 6. Documents written

- `campaign/hashtagBar` — written and read back `2026-08-30T22:56:51Z` (12 posts; control
  and groups carried forward with their 2026-08-29 timestamps)
- `campaign/commentQueue` — **not touched, by design.** Owned by the daily scan, which
  wrote it 3h earlier with two live targets.
