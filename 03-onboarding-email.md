# 7-Day Onboarding Email Sequence — Multi-Exam, Merge-Tagged

> **Spec source:** MARKETING-PLAN.md §9.2 ("7-day onboarding email sequence"). Days 0, 1, 2, 3, 5, 6, 7. Day 4 is intentionally empty per the plan.
>
> **Voice:** Product voice ("we"), not founder voice. Plain-spoken, no hype. Reading level 8th–10th grade.
>
> **Per-email rules** (plan §9.2): exactly **one CTA** per email. No fluff. Subject line ≤ 50 chars where possible.
>
> **A/B subject lines:** 3 variants per email. Run as 33/33/33 split; pick the winner after 100 sends per variant.

---

## The merge-tag system — read this first

Every email below is **the same template across all 11 live exams.** What varies is the merge-tag fill. The user picks their exam on Day 0 (per the plan); from Day 1 forward, every email pulls from a per-user variable set:

| Tag | Meaning | Example for a PMP user | Example for a Security+ user | Example for a SHRM-CP user |
|---|---|---|---|---|
| `{{exam_name}}` | Cert short name (displayed to user) | PMP | Security+ | SHRM-CP |
| `{{exam_full_name}}` | Full cert name (formal) | Project Management Professional | CompTIA Security+ (SY0-701) | SHRM Certified Professional |
| `{{exam_lens}}` | The Decision Lens for this exam (verified from `EXAM_LENS` in `web/src/config/exams.ts`) | Exam Lens | Exam Lens | Exam Lens |
| `{{exam_lens_prompt}}` | The framework prompt for the lens | What would PMI want you to do? | CIA triad — which principle is being protected? | What aligns with SHRM behavioral competencies? |
| `{{weakest_domain}}` | User's per-exam weakest domain | People domain | Threats, Vulnerabilities, and Mitigations | Organization |
| `{{weakest_domain_slug}}` | URL slug for the weak domain | `people` | `threats` | `organization` |
| `{{strongest_domain}}` | User's strongest domain so far | Process | Operations | People |
| `{{top_trap}}` | Most common thinking-trap (per `users/{uid}/examStats/{examId}/traps`) | "Picks process-correct over PMI-correct" | "Picks the control before naming the CIA principle" | "Picks pragmatic over competency-aligned" |
| `{{full_mock_questions}}` | Questions in this exam's Full Mock | 180 | 90 | 134 |
| `{{full_mock_minutes}}` | Time on this exam's Full Mock | 230 | 90 | 220 |
| `{{question_count}}` | Questions the user has answered so far | dynamic | dynamic | dynamic |
| `{{days_remaining}}` | Trial days remaining | dynamic | dynamic | dynamic |
| `{{traps_count}}` | Distinct thinking-traps the system has logged for this user | dynamic | dynamic | dynamic |
| `{{first_name}}`, `{{app_url}}` | Standard | — | — | — |

**EXAM_LENS reference (full table, all 11 live exams, from the context skill):**

| `{{exam_name}}` | `{{exam_lens}}` | `{{exam_lens_prompt}}` |
|---|---|---|
| PMP | Exam Lens | What would PMI want you to do? |
| PgMP | Exam Lens | How does this serve the program's strategic objectives and benefits realization? |
| CSM | Exam Lens | What does the Scrum Guide say the role should do? |
| SHRM-CP | Exam Lens | What aligns with SHRM behavioral competencies? |
| Six Sigma GB | Exam Lens | Where does this fall in Define-Measure-Analyze-Improve-Control? |
| CPP | Exam Lens | What does federal/state payroll law require? |
| CIA Part 1 | Exam Lens | What do the IIA Standards of Practice say? |
| ITIL 4 | Exam Lens | How does this serve the ITIL service value chain? |
| Security+ | Exam Lens | CIA triad — which principle is being protected? |
| Network+ | Exam Lens | What layer is this, and what's the systematic fix? |
| A+ Core 2 | Exam Lens | What step of the CompTIA troubleshooting model? |

If `{{exam_name}}` is empty on Day 1 (user signed up but never picked an exam), do NOT send the personalized Day 1 — branch to a "pick your exam" nudge instead.

---

# Part A — Fully-worked example sequence (PMP user)

Below is the full 7-day sequence as it would land in a PMP user's inbox. After this, Part B shows the merge-tag swap pattern for Security+ and SHRM-CP on the three highest-stakes emails (Day 1, Day 2, Day 6).

## Day 0 — Welcome / pick your exam

**Trigger:** immediately after `signup_complete` event.

**Subject (A/B 3 variants — exam-agnostic, sent before exam pick):**

A. Welcome to CipherExam — start with your exam
B. You're in. Pick the exam you're preparing for.
C. First step: which certification are you studying for?

**Body:**

> Hi {{first_name}},
>
> Welcome to CipherExam. You've got a 7-day free trial — no credit card on file, cancel anytime — to use the whole product.
>
> Before you do anything else, pick the exam you're preparing for. The product is exam-aware: every question, every explanation, every analytics view changes based on which cert you're studying. Picking your exam is what unlocks the rest.
>
> If you're studying for more than one cert, pick the one you're sitting first. You can add the second later from your dashboard.
>
> One link, one action:
>
> **[Pick your exam →]({{app_url}}/select-exam)**
>
> — The CipherExam team

**One CTA:** "Pick your exam" → `/select-exam`

---

## Day 1 — Your weakest domain identified

**Trigger:** 24 hours after signup, IF user has answered ≥ 5 questions. Else: branch to "let's get started" nudge.

**Subject (A/B 3 variants — PMP user):**

A. Your weakest PMP domain so far: People
B. We spotted a pattern in your first {{question_count}} questions
C. Where you're losing PMP points (and how to fix it)

**Body:**

> Hi {{first_name}},
>
> You've answered {{question_count}} PMP questions so far. Long enough for us to start spotting patterns.
>
> Your weakest domain right now is **People** — you're at 62% there, vs. 81% across the rest of your practice.
>
> What's interesting isn't the score. It's *what kind of question* you're missing in People. Looking at your last few wrong answers, you're picking the procedurally correct option over the PMI-relationally correct one — that's a Bloom's-level signal (evaluate), not a knowledge gap.
>
> We've built you a targeted practice set: 15 questions specifically in the People domain, weighted toward the cognitive level you've been missing.
>
> **[Practice your weak domain →]({{app_url}}/practice?domain=people&focus=traps)**
>
> If you've got 15 minutes today, this is where to spend them.
>
> — The CipherExam team

**One CTA:** "Practice your weak domain" → `/practice?domain={{weakest_domain_slug}}&focus=traps`

---

## Day 2 — Decision Lens for this exam (was: "How AI explanations improve scores")

**Trigger:** 48 hours after signup.

> **Note on the framing shift:** the plan §9.2 lists Day 2 as "How AI explanations improve scores." Per the user direction in this rebuild, Day 2 is reframed to **introduce the per-exam Decision Lens by name** — same core idea (our explanations are different) but anchored on the lens framework that's a verified product differentiator. Small wording shift; CTA unchanged. **`[CONFIRMED 2026-05-11 by Dave]` — the lens-named framing is locked.**

**Subject (A/B 3 variants — PMP user):**

A. The Exam Lens (and why your PMP score depends on it)
B. The 30-second habit that moves your PMP score
C. Why our PMP explanations name the lens

**Body:**

> Hi {{first_name}},
>
> Every PMP prep tool gives you the right answer. Most of them give you a one-line explanation: "C is correct because X."
>
> That's the wrong half of the answer.
>
> The half that actually moves your PMP score is the part that says: *what would PMI want you to do?* That's the Exam Lens, and it's the reasoning frame the exam grades you against. Knowing the right answer to one question doesn't transfer. Knowing the lens transfers to every question.
>
> Every CipherExam explanation walks through the lens first, then the answer. Read the lens section, not just the answer. The 30 seconds you spend there is what compounds across the 200+ questions you'll see between now and your exam.
>
> Quick test of the habit: pick any question you've already answered, click in, and read the lens section. Not just "C is correct" — the lens.
>
> **[Try an explanation →]({{app_url}}/history)**
>
> — The CipherExam team

**One CTA:** "Try an explanation" → `/history`

---

## Day 3 — Complete your diagnostic

**Trigger:** 72 hours after signup.

**Subject (A/B 3 variants):**

A. You're 3 days in. Finish your diagnostic.
B. {{question_count}} questions answered. Here's what's missing.
C. The one report you should generate this week

**Body:**

> Hi {{first_name}},
>
> You've answered {{question_count}} PMP questions in your first three days. Enough to generate a real diagnostic.
>
> The Readiness Report combines two things: your per-domain accuracy *and* the thinking-traps you keep falling into. Together, those two views tell you where your remaining prep time should go.
>
> Most people skip this and just keep practicing. That's leaving information on the table — especially the traps view, which surfaces patterns you wouldn't spot just looking at scores.
>
> 10 seconds to generate. 3 minutes to read.
>
> **[Generate your Readiness Report →]({{app_url}}/readiness)**
>
> — The CipherExam team

**One CTA:** "Generate your Readiness Report" → `/readiness`

---

## Day 4 — intentionally empty per plan §9.2.

---

## Day 5 — Your progress + social proof

**Trigger:** 5 days after signup.

**Subject (A/B 3 variants):**

A. {{first_name}}, here's how your week went
B. You're outperforming most week-1 users in Process
C. Your PMP progress so far (and what's next)

**Body:**

> Hi {{first_name}},
>
> Five days in. Quick recap of where you are:
>
> - Questions answered: **{{question_count}}**
> - Strongest domain: **Process** (82%)
> - Domain that needs the most work: **People** (62%)
> - Most common thinking-trap: **picks process-correct over PMI-correct**
>
> A common pattern for users who pass PMP on the first attempt: they spend the last third of prep deliberately practicing their weakest domain *plus* their top trap, instead of doing more random practice across the whole exam.
>
> You've got {{days_remaining}} days left on your trial. The highest-leverage move from here is targeted practice in People, weighted toward the trap above.
>
> **[Continue practicing →]({{app_url}}/practice?focus=weak)**
>
> — The CipherExam team

**One CTA:** "Continue practicing" → `/practice?focus=weak`

---

## Day 6 — Trial ending tomorrow (cert-specific deadline framing)

**Trigger:** 6 days after signup. **Highest-stakes email — conversion happens here.**

**Subject (A/B 3 variants — PMP user):**

A. Your CipherExam trial ends tomorrow
B. Tomorrow: you lose the 180-question PMP Full Mock
C. {{first_name}}, one day left on your trial

**Body:**

> Hi {{first_name}},
>
> Your free trial ends tomorrow. After that, your account drops to the free Starter plan — 5 questions per day, basic explanations, no Full Mock simulator, no Readiness Report.
>
> Here's what you've done in 6 days:
>
> - Answered {{question_count}} PMP questions
> - Identified People as your weakest domain
> - Logged {{traps_count}} thinking-traps the system is tracking for you
>
> The PMP Full Mock is the closest simulation to PMI's actual exam structure you'll find: 180 questions, 230 minutes, with EMV math and matching items included. You lose access to that simulator tomorrow if you don't keep going.
>
> Pro is **$19/month, or $189/year (save 17%)**. Cancel anytime. We don't charge for the trial.
>
> **[Upgrade to Pro →]({{app_url}}/upgrade)**
>
> — The CipherExam team

**One CTA:** "Upgrade to Pro" → `/upgrade`

---

## Day 7 — Final convert offer

**Trigger:** morning of the trial-end day.

**Subject (A/B 3 variants):**

A. Last day: Pro is $19/mo, cancel anytime
B. {{first_name}}, decision time
C. Trial ends tonight. Subscribe?

**Body:**

> Hi {{first_name}},
>
> Your trial ends tonight. No surprise charge — we never put a card on file.
>
> If CipherExam helped you see PMP questions differently this week, Pro is **$19/month** ($189/year if you go annual, saving 17%). Cancel any time from your dashboard.
>
> If it didn't click, that's fine too — you'll drop to the free tier automatically. No action required. We'd love a one-line reply telling us what didn't land, so we can fix it.
>
> **[Subscribe to Pro →]({{app_url}}/upgrade)**
>
> — The CipherExam team

**One CTA:** "Subscribe to Pro" → `/upgrade`

---

# Part B — How Day 1, Day 2, and Day 6 swap content per cert

The template is the same. The merge tags change. Below are the three highest-stakes emails (weakest-domain on D1, Decision Lens introduction on D2, cert-specific deadline framing on D6) rendered for **Security+** and **SHRM-CP** so the pattern is unambiguous.

## Day 1 (Security+ user)

**Subject A:** Your weakest Security+ domain so far: Threats

**Body:**

> Hi {{first_name}},
>
> You've answered {{question_count}} Security+ questions so far. Long enough to spot patterns.
>
> Your weakest domain right now is **Threats, Vulnerabilities, and Mitigations** — you're at 64% there, vs. 79% elsewhere.
>
> What's interesting isn't the score. It's *what kind of question* you're missing. Looking at your last few wrong answers, you're picking the control before naming which CIA-triad principle is being protected — that's a lens-application miss, not a knowledge gap.
>
> Targeted practice set: 15 questions in the Threats domain, weighted toward the cognitive level you've been missing.
>
> **[Practice your weak domain →]({{app_url}}/practice?domain=threats&focus=traps)**
>
> — The CipherExam team

## Day 1 (SHRM-CP user)

**Subject A:** Your weakest SHRM-CP domain so far: Organization

**Body:**

> Hi {{first_name}},
>
> You've answered {{question_count}} SHRM-CP questions so far. Long enough to spot patterns.
>
> Your weakest domain right now is **Organization** — you're at 65% there, vs. 80% elsewhere.
>
> The interesting part isn't the score — it's the kind of question you're missing. You're picking the pragmatic HR move over the competency-aligned one. That's a Exam Lens miss, not a knowledge gap.
>
> Targeted practice set: 15 questions in the Organization domain, weighted toward situational-judgment items.
>
> **[Practice your weak domain →]({{app_url}}/practice?domain=organization&focus=traps)**
>
> — The CipherExam team

## Day 2 (Security+ user)

**Subject A:** The CIA triad (and why your Security+ score depends on it)

**Body:**

> Hi {{first_name}},
>
> Every Security+ prep tool gives you the right answer. Most of them give you a one-line explanation.
>
> That's the wrong half of the answer.
>
> The half that moves your Security+ score is the part that asks: *which leg of the CIA triad is being protected — confidentiality, integrity, or availability?* That's the Exam Lens, and it's how the exam decides which control is "correct." Memorizing controls doesn't transfer. Naming the principle first does.
>
> Every CipherExam Security+ explanation names the triad principle first, then the control. Read the lens section, not just the answer.
>
> **[Try an explanation →]({{app_url}}/history)**

## Day 2 (SHRM-CP user)

**Subject A:** The Exam Lens (and why your situational answers feel arbitrary)

**Body:**

> Hi {{first_name}},
>
> Every SHRM-CP prep tool gives you the right answer. Most explain *what* — not *why this answer aligns with the SHRM competency model.*
>
> That's the half that actually moves your score. SHRM-CP grades situational questions against the nine behavioral competencies. Knowing the competencies isn't enough — you need the reflex of *naming which competency the question is testing* before you pick.
>
> Every CipherExam SHRM-CP explanation names the competency first, then the answer. Read the lens section.
>
> **[Try an explanation →]({{app_url}}/history)**

## Day 6 (Security+ user)

**Subject B:** Tomorrow: you lose PBQ simulator access

**Body excerpt** (rest identical to PMP version):

> The Security+ Full Mock is the only simulator that runs MCQ + matching + PBQs together — 90 questions in 90 minutes, the same structure CompTIA uses. You lose PBQ practice tomorrow if you don't keep going.

## Day 6 (SHRM-CP user)

**Subject B:** Tomorrow: you lose the 134-question SHRM-CP Full Mock

**Body excerpt:**

> The SHRM-CP Full Mock runs 134 questions in 220 minutes — the same length and pacing as the actual SHRM-CP exam. Practicing under those time constraints is where most candidates close the situational-judgment gap. You lose that simulator tomorrow.

---

## Per-cert deadline-framing snippets for Day 6 (full table)

| `{{exam_name}}` | Subject B variant | Body insertion |
|---|---|---|
| PMP | Tomorrow: you lose the 180-question PMP Full Mock | "180 questions, 230 minutes, with EMV math and matching." |
| PgMP | Tomorrow: you lose the 170-question PgMP Full Mock | "170 questions, 240 minutes. There's not another simulator like it for PgMP." |
| CSM | Tomorrow: trial ends — 50-question CSM mocks gone | "50 questions, 60 minutes — the closest pacing match to the real CSM assessment." |
| SHRM-CP | Tomorrow: you lose the 134-question SHRM-CP Full Mock | "134 questions, 220 minutes — actual exam length and pacing." |
| Six Sigma GB | Tomorrow: you lose the 110-question Six Sigma Full Mock | "110 questions, 258 minutes — DMAIC-classified throughout." |
| CPP | Tomorrow: you lose the 190-question CPP Full Mock | "190 questions, 240 minutes — every question explained through the Exam Lens." |
| CIA Part 1 | Tomorrow: you lose the 125-question CIA Part 1 Full Mock | "125 questions, 150 minutes — explained against IIA Standards." |
| ITIL 4 | Tomorrow: trial ends — 40-question ITIL 4 mocks gone | "40 questions, 60 minutes — actual ITIL 4 Foundation exam length." |
| Security+ | Tomorrow: you lose PBQ simulator access | "90 questions, 90 minutes, with native PBQ support — the differentiator vs. flashcard-only banks." |
| Network+ | Tomorrow: you lose PBQ simulator access | "90 questions, 90 minutes, with native PBQ + Exam Lens explanations." |
| A+ Core 2 | Tomorrow: you lose PBQ simulator access | "90 questions, 90 minutes, with native PBQ + Exam Lens explanations." |

---

## Sequence operations notes

- **Send times:** 9:00 local time for the user's timezone. Default to UTC 14:00 if unknown.
- **Suppression:** if a user converts to paid mid-sequence, suppress Days 6 + 7 and switch to the post-conversion track.
- **List hygiene:** unsubscribe / double-bounce → removed same day.
- **Reply handling:** all emails are reply-able to a Dave-monitored inbox. Plan §9.3 specifies day-7 replies are a goldmine for product feedback.
- **Tracking:** UTM `utm_source=email&utm_medium=onboarding&utm_campaign=day{N}_{variant}_{exam}`. The `{exam}` tag is **new** in this rebuild — needed to attribute trial-to-paid lift by exam cluster, not just by day/variant.
- **Dormant-user nurture (post Day 7):** non-converters drop into a monthly cadence focused on new blog posts and new exam coverage. Out of scope for this file.
