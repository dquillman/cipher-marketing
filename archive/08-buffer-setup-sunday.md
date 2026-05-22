# Buffer Setup — Sunday 2026-05-17

> **DEFERRED (2026-05-12) — not used for Week 1.** Manual posting for Week 1; see `campaign-state.json → preLaunchChecklist → phone-alarms-set` and the `decisions` entry from 2026-05-12. Revisit this doc when posting volume exceeds ~15 posts/week or Dave is unavailable on a posting morning. Copy below is still accurate — the schema (file paths, post copy, UTM tags) matches `posts.json` and can be reused as-is.

**Goal:** Schedule all 6 Week 1 PMP posts in Buffer in one Sunday-night sitting. Work through the checklist top-to-bottom — each post is self-contained.

**Window:** Schedule between 6:00 PM and 9:00 PM ET Sunday 2026-05-17. All posts publish Mon/Wed/Fri of Week 1 (2026-05-18 → 2026-05-22).

**Channels needed in Buffer:**
- LinkedIn personal profile (Dave)
- X (Twitter) personal account (Dave)

**Source of truth for copy:** `C:\dev\cipher-marketing\site\data\posts.json` — if anything below diverges, the JSON wins. The dashboard at `http://localhost:8766/app.html` renders the same data.

**Pre-flight (do once, not per post):**
- [ ] Both LinkedIn and X channels are connected in Buffer
- [ ] Buffer timezone is set to **America/New_York (ET)** — Buffer schedules in your set timezone, so this matters
- [ ] All 6 video files exist locally at `C:\dev\cipher-marketing\videos\out\` (verify the 4 unique files listed below)

**Video files used this week (4 unique, served 6 times — Mon/Wed share nothing; LinkedIn and X share the same source on Mon and Fri but use different aspect-ratio cuts on Wed):**
- `launch-teaser-pmp.mp4` — 1:1, used Mon LinkedIn + Mon X
- `ai-tutor-demo-pmp.mp4` — 9:16, used Wed X
- `ai-tutor-demo-pmp-li.mp4` — 1:1, used Wed LinkedIn (same content, LinkedIn-cropped)
- `domain-weights-pmp.mp4` — 1:1, used Fri LinkedIn + Fri X

---

## Post 1 of 6 — Monday LinkedIn (launch)

- [ ] **Channel:** LinkedIn (personal)
- [ ] **Schedule time:** Monday 2026-05-18, **08:00 AM ET**
- [ ] **Video attachment:** `C:\dev\cipher-marketing\videos\out\launch-teaser-pmp.mp4` (1:1)
- [ ] **Copy (paste verbatim):**

```
Cert prep tools haven't changed since 2010.

Bigger question banks. Prettier flashcards. Same broken loop: memorize the right answer, forget it, repeat.

The actual exams aren't testing your memory. They're testing whether you can think the way PMI thinks. Or the way (ISC)² thinks. Or SHRM.

So I built CipherExam.

Every question comes with an AI explanation of why the wrong answers *look* right — because that's where candidates actually lose points. Not on the content. On the framing.

Live now for 11 certifications. Starting with PMP.

7-day free trial, no card: cipherexam.com/lp/pmp?utm_source=linkedin&utm_campaign=launch_week1&utm_content=mon_launch
```

- [ ] **First comment** (optional, leave blank — the link is already in the post body): n/a
- [ ] **Scheduled** confirmed in Buffer queue

---

## Post 2 of 6 — Monday X (launch)

- [ ] **Channel:** X (Twitter, personal)
- [ ] **Schedule time:** Monday 2026-05-18, **09:00 AM ET**
- [ ] **Video attachment:** `C:\dev\cipher-marketing\videos\out\launch-teaser-pmp.mp4` (1:1, same file as LinkedIn — X accepts 1:1)
- [ ] **Copy (paste verbatim):**

```
Cert prep tools haven't changed since 2010. Bigger banks. Prettier flashcards. Same broken loop.

The exams aren't testing your memory. They're testing how you think.

So I built CipherExam. 7 days free, no card:
cipherexam.com/lp/pmp
```

- [ ] **Note:** The X copy intentionally drops the visible UTMs to stay under the character limit; the tracking link `cipherexam.com/lp/pmp?utm_source=x&utm_campaign=launch_week1&utm_content=mon_launch` is what gets clicked when Buffer / X auto-resolves the bare domain. If Buffer asks you to paste the full URL, paste the full tracked one:

```
cipherexam.com/lp/pmp?utm_source=x&utm_campaign=launch_week1&utm_content=mon_launch
```

- [ ] **Scheduled** confirmed in Buffer queue

---

## Post 3 of 6 — Wednesday LinkedIn (why-B-is-a-trap)

- [ ] **Channel:** LinkedIn (personal)
- [ ] **Schedule time:** Wednesday 2026-05-20, **08:00 AM ET**
- [ ] **Video attachment:** `C:\dev\cipher-marketing\videos\out\ai-tutor-demo-pmp-li.mp4` (1:1 — note the `-li` suffix, this is the LinkedIn-cropped version)
- [ ] **Copy (paste verbatim):**

```
Every PMP prep tool tells you the right answer.

We tell you why the wrong ones look right.

Most candidates don't fail because they didn't study. They fail because PMI writes four plausible options and three of them are *almost* right — right for the wrong scenario, right under classical PM, right if you skip a stakeholder.

If your prep doesn't teach you to spot the trap, your prep isn't preparing you for the test.

Try one free: cipherexam.com/lp/pmp?utm_source=linkedin&utm_campaign=launch_week1&utm_content=wed_tutor
```

- [ ] **Scheduled** confirmed in Buffer queue

---

## Post 4 of 6 — Wednesday X (why-B-is-a-trap)

- [ ] **Channel:** X (personal)
- [ ] **Schedule time:** Wednesday 2026-05-20, **09:00 AM ET**
- [ ] **Video attachment:** `C:\dev\cipher-marketing\videos\out\ai-tutor-demo-pmp.mp4` (9:16 — note: NO `-li` suffix, this is the vertical version for X)
- [ ] **Copy (paste verbatim):**

```
Most PMP prep tells you the right answer.

We tell you why the wrong ones look right.

Candidates don't fail on content. They fail because PMI writes 4 plausible options and 3 are *almost* right.

Try one free → cipherexam.com/lp/pmp
```

- [ ] **Full tracked URL if Buffer asks for it:**

```
cipherexam.com/lp/pmp?utm_source=x&utm_campaign=launch_week1&utm_content=wed_tutor
```

- [ ] **Scheduled** confirmed in Buffer queue

---

## Post 5 of 6 — Friday LinkedIn (domain-weights)

- [ ] **Channel:** LinkedIn (personal)
- [ ] **Schedule time:** Friday 2026-05-22, **08:00 AM ET**
- [ ] **Video attachment:** `C:\dev\cipher-marketing\videos\out\domain-weights-pmp.mp4` (1:1)
- [ ] **Copy (paste verbatim):**

```
Quick PMP reality check.

Process is 50% of the exam.

Half. Of the entire test. One domain.

Most candidates spend equal time on all three — People, Process, Business Environment — because that's how the courses are structured. Then they wonder why their practice scores plateau at 65%.

CipherExam routes you adaptively to the domains where you're weakest. So if you're underweight on Process, that's where the next question comes from. Not the next random question. The next *useful* one.

cipherexam.com/lp/pmp?utm_source=linkedin&utm_campaign=launch_week1&utm_content=fri_domains
```

- [ ] **Scheduled** confirmed in Buffer queue

---

## Post 6 of 6 — Friday X (domain-weights)

- [ ] **Channel:** X (personal)
- [ ] **Schedule time:** Friday 2026-05-22, **09:00 AM ET**
- [ ] **Video attachment:** `C:\dev\cipher-marketing\videos\out\domain-weights-pmp.mp4` (1:1, same file as LinkedIn)
- [ ] **Copy (paste verbatim):**

```
Quick PMP reality check:

Process is 50% of the exam.

Half. One domain.

Most candidates split study time evenly across all three. CipherExam routes you adaptively to your weakest. cipherexam.com/lp/pmp
```

- [ ] **Full tracked URL if Buffer asks for it:**

```
cipherexam.com/lp/pmp?utm_source=x&utm_campaign=launch_week1&utm_content=fri_domains
```

- [ ] **Scheduled** confirmed in Buffer queue

---

## Wrap-up (after all 6 are queued)

- [ ] Open Buffer's queue view and confirm 6 posts appear, three on LinkedIn (08:00 ET Mon/Wed/Fri) and three on X (09:00 ET Mon/Wed/Fri)
- [ ] Quick eyeball — every post has its video attached (no broken paperclips)
- [ ] Close Buffer

**That's the whole week pre-scheduled.** Monday morning, just spot-check that the 08:00 ET LinkedIn post went out and the 09:00 ET X post went out — see `09-monday-phone-check.md`.

## Summary table (for at-a-glance reference while loading Buffer)

| # | Day | Time ET | Channel | Hook | Video file (under `videos/out/`) | Format |
|---|---|---|---|---|---|---|
| 1 | Mon 5/18 | 08:00 | LinkedIn | tool-builder | `launch-teaser-pmp.mp4` | 1:1 |
| 2 | Mon 5/18 | 09:00 | X | tool-builder | `launch-teaser-pmp.mp4` | 1:1 |
| 3 | Wed 5/20 | 08:00 | LinkedIn | why-B-is-a-trap | `ai-tutor-demo-pmp-li.mp4` | 1:1 |
| 4 | Wed 5/20 | 09:00 | X | why-B-is-a-trap | `ai-tutor-demo-pmp.mp4` | 9:16 |
| 5 | Fri 5/22 | 08:00 | LinkedIn | domain-weights | `domain-weights-pmp.mp4` | 1:1 |
| 6 | Fri 5/22 | 09:00 | X | domain-weights | `domain-weights-pmp.mp4` | 1:1 |
