# Multi-Exam Landing Page Reference Copy — Tier 1 Clusters

> # DRAFT — NOT FOR LIVE DEPLOYMENT
>
> This is reference copy for the three per-exam ad landing pages that map to the Tier 1 campaign clusters in the brief. **All routes (`/lp/...`) are proposed** `[ASSUMPTION 2026-05-11]` — verify with Dave before standing up routes in `web/src/`.
>
> **Voice:** Product voice ("we"). No founder narrative on the LPs themselves — that lives at `/story`. The LPs are ad destinations, optimized for `signup_complete` per the brief's funnel.
>
> **Pricing block:** **verbatim** from the live `/pricing` page as verified 2026-05-11. Do NOT modify. If we discover a pricing change, update the context skill first, then update these LPs.
>
> **Universal CTA:** *Start Free Trial.* Button color and placement should match the existing site primary CTA.

---

## Shared template structure (use this for every per-exam LP)

```
[ Hero ]
  - H1: cert-specific reasoning-frame headline
  - Subhead: cert-specific Decision Lens callout
  - Primary CTA: Start Free Trial (button)
  - Microcopy under CTA: "Start your free 7-day trial. No credit card required."

[ Problem section ]
  - 3-sentence statement of the specific failure mode for THIS cert's candidates
  - Avoid generic SaaS framing. Use the cert's actual question patterns.

[ Solution section ]
  - The 3 verified differentiators that compound for THIS cert:
    1. Bloom's classification (universal)
    2. Per-exam Decision Lens (cert-specific lens name)
    3. Exam-specific feature (e.g., PBQs for CompTIA, EMV math for PMP, 134-question Full Mock for SHRM-CP)

[ Decision Lens callout ]
  - Boxed quote-style component naming the lens
  - One-sentence framework prompt

[ "Try a Question" widget ]
  - Single embedded {{exam_name}} question, answerable inline
  - Reveal: answer + the lens-driven reasoning + the Bloom's level tag
  - CTA below: "See more questions explained → Start Free Trial"

[ Pricing card ]
  - VERBATIM from /pricing — Starter $0 / Pro $19/mo (yearly saves 17%) / 7-day trial / no card
  - Single CTA below: Start Free Trial

[ FAQ ]
  - 4-5 cert-specific FAQs:
    - "Is this aligned to the [latest exam version]?"
    - "Do you cover [exam-specific question type]?"
    - "How many questions are in the Full Mock?"
    - "Cancel anytime?"
    - "Do you support [cert-specific objective]?"

[ Footer CTA ]
  - One more Start Free Trial button
  - "7-day free trial. No credit card. Cancel anytime."
```

---

## LP #1 — `/lp/pmp-practice`

**Meta title:** PMP Practice with Exam Lens Explanations — CipherExam
**Meta description:** Practice PMP questions explained through the Exam Lens. 180-question Full Mock with EMV math. 7-day free trial. No credit card.

### Hero

> **H1: Practice PMP the way PMI thinks.**
>
> **Subhead:** Every CipherExam answer is explained through the Exam Lens — *what would PMI want you to do?* — plus the Bloom's-level reasoning behind the question. Memorizing the PMBOK isn't enough. Reading the question the way the test writers do is.
>
> **[Start Free Trial]**
> *Start your free 7-day trial. No credit card required.*

### Problem section

> Most PMP candidates plateau around 80% on practice tests and never break through. The reason isn't a knowledge gap — it's a frame gap. PMI grades whether you think like a PMI-certified PM, not whether you know every ITTO. Practice tools that just drill facts can't close that gap.

### Solution section

**Three things compound for PMP:**

1. **Bloom's-classified practice.** Every PMP question is tagged by cognitive level. You see whether you're nailing easy "remember" questions but missing the "evaluate"-level scenarios that dominate the real exam.
2. **Exam Lens explanations.** Every right and wrong answer is walked through the same lens — *what would PMI want you to do?* — so you internalize the frame, not just the facts.
3. **180-question Full Mock with EMV math.** Same length and pacing as the actual PMP. EMV / earned-value math is supported natively, not buried in a text box.

### Decision Lens callout

> **The Exam Lens**
>
> *What would PMI want you to do?*
>
> Every PMP question is testing this. We make it explicit on every explanation.

### Try a Question widget

> **Try a PMP question:**
>
> (Illustrative — not from any real exam.) A stakeholder demands a scope change on Friday afternoon. Your scrum team's next sprint starts Monday. What do you do *first*?
>
> A. Tell the stakeholder to submit a formal change request
> B. Prepare an impact analysis and schedule a stakeholder meeting Monday
> C. Reject the request — scope was signed off
> D. Adjust the next sprint backlog
>
> **[Reveal answer]**
>
> → Answer: **B**. The Exam Lens prioritizes *understanding the change* and *bringing stakeholders together* as a first move. A is the textbook process answer but PMI-relationally cold. Bloom's level: **evaluate.**
>
> **[Start Free Trial to see more questions like this →]**

### Pricing card

(Verbatim from `/pricing`, 2026-05-11)

| Starter | Pro Membership ★ POPULAR |
|---|---|
| **$0 / forever** | **$19 / month** (yearly saves 17% — ~$189/yr) |
| Daily Quiz (5 Questions) | Unlimited AI Quizzes |
| Basic Progress Tracking | Detailed Domain Analytics |
| Standard Explanations | Priority Support |
| Community Exam Coverage | Full Exam Simulators |
| Study Plan (Basic) | AI-Powered Study Plans |
| — | **7-day free trial. Cancel anytime. No credit card required.** |

*Secure payments powered by Stripe.*

**[Start Free Trial]**

### FAQ

- **Is this aligned to the current PMP exam (post-2021 update)?** Yes — the question library is built against PMI's current published exam objectives (People / Process / Business Environment).
- **Do you cover EMV / earned-value math?** Yes, natively. EMV questions are interactive, not just text — the Full Mock supports the calculations.
- **How many questions is the Full Mock?** 180 questions in 230 minutes — the same length as the actual PMP exam.
- **Can I cancel anytime?** Yes. The 7-day trial never charges a card. Pro is month-to-month or yearly; cancel from your dashboard.
- **Do you have CAPM coverage?** Not yet. PMP is fully live. We're adding adjacent PMI certifications based on user demand.

### Footer CTA

> Ready to read PMP questions the way the writers do?
>
> **[Start Free Trial]**
>
> *7-day free trial. No credit card. Cancel anytime.*

---

## LP #2 — `/lp/security-plus-practice`

**Meta title:** CompTIA Security+ PBQ Simulator with CIA Triad Explanations — CipherExam
**Meta description:** Native PBQ simulation for Security+ SY0-701. Every question explained through the CIA triad. 90-question Full Mock. 7-day free trial. No credit card.

### Hero

> **H1: Stop bombing Security+ PBQs.**
>
> **Subhead:** CipherExam runs CompTIA Security+ (SY0-701) Performance-Based Questions *natively* — drag-and-drop, network topology, and CLI items — and explains every answer through the CIA triad. Pass the simulator that matches the real exam.
>
> **[Start Free Trial]**
> *Start your free 7-day trial. No credit card required.*

### Problem section

> Most Security+ candidates pass every practice quiz at 90%+ and still walk out of the testing center shaken. The reason: question banks drill facts, but the real Security+ exam mixes MCQ with Performance-Based Questions — and PBQs test whether you can *operate*, not whether you can *recognize*. Flashcards can't close that gap.

### Solution section

**Three things compound for Security+:**

1. **Native PBQ simulation.** Drag-and-drop firewall rules, match attacks to controls, parse CLI output — the same item types CompTIA uses, not text approximations. This is the wedge against flashcard-only competitors.
2. **CIA-triad-first explanations.** Every right and wrong answer names the triad principle (confidentiality / integrity / availability) being tested *before* the control. Naming the principle first is what makes PBQs feel like 30-second questions instead of 5-minute panics.
3. **90-question Full Mock at exam pacing.** 90 questions in 90 minutes — the same length CompTIA uses. MCQ + matching + PBQ in one session.

### Decision Lens callout

> **The Exam Lens**
>
> *CIA triad — which principle is being protected?*
>
> Name the principle first. The control follows.

### Try a Question widget

> **Try a Security+ question:**
>
> (Illustrative — not from any real exam.) Which control best ensures sensitive customer records remain unaltered while transmitted across an untrusted network?
>
> A. TLS encryption
> B. HMAC / digital signatures
> C. AES-256 at rest
> D. RADIUS authentication
>
> **[Reveal answer]**
>
> → Answer: **B**. The CIA principle is **integrity** — unaltered during transit. TLS (A) gives you confidentiality first; integrity is a side effect. HMAC and digital signatures give you integrity directly. Name the principle first; the control follows. Bloom's level: **analyze.**
>
> **[Start Free Trial to see PBQs in the simulator →]**

### Pricing card

(Verbatim, identical to LP #1 above.)

### FAQ

- **Is this current for SY0-701?** Yes — the question library is built against CompTIA's published SY0-701 exam objectives.
- **Do PBQs actually work in the simulator?** Yes. Drag-and-drop, matching, and topology items are native. Not text-only approximations.
- **How many questions is the Full Mock?** 90 questions in 90 minutes — the same as CompTIA's exam.
- **Will this help me pass Network+ or other CompTIA certs next?** Network+ is fully live — same Bloom's classification and PBQ support, with the Exam Lens. CISSP is on the roadmap.
- **Cancel anytime?** Yes. 7-day trial never charges a card.

### Footer CTA

> Practice the question type that actually fails most candidates.
>
> **[Start Free Trial]**
>
> *7-day free trial. No credit card. Cancel anytime.*

---

## LP #3 — `/lp/shrm-cp-practice`

**Meta title:** SHRM-CP Practice with Competency Lens Explanations — CipherExam
**Meta description:** SHRM-CP situational-judgment practice explained through the SHRM competency model. 134-question Full Mock at real exam pacing. 7-day free trial. No credit card.

### Hero

> **H1: SHRM-CP situational questions, decoded.**
>
> **Subhead:** Three of four answer choices will be defensible HR moves. The "right" one aligns with a specific SHRM behavioral competency. CipherExam names the competency on every explanation, so you train the reflex the exam actually grades.
>
> **[Start Free Trial]**
> *Start your free 7-day trial. No credit card required.*

### Problem section

> Most senior HR pros fail SHRM-CP not because they lack knowledge — but because they've spent years making pragmatic HR calls. The exam grades you against an idealized competency frame, and pragmatic answers score lower than the answer that visibly enacts a named SHRM competency. Knowing the nine competencies isn't enough. Naming which one is being tested *before* you pick is the skill.

### Solution section

**Three things compound for SHRM-CP:**

1. **Bloom's-classified practice.** SHRM-CP is heavy on *evaluate*-level situational judgment. Our classification tells you whether you're missing easy items or the high-cognitive items that dominate the scored questions.
2. **Exam Lens explanations.** Every right and wrong answer names which of the nine behavioral competencies (Leadership, Ethical Practice, Business Acumen, Relationship Management, Consultation, Critical Evaluation, Global Mindset, Cultural Effectiveness, Communication) is being tested.
3. **134-question Full Mock at real exam pacing.** 134 questions in 220 minutes — the same length and pacing as the actual SHRM-CP exam. Time pressure is where pragmatic-vs-competency reflexes break; we train both.

### Decision Lens callout

> **The Exam Lens**
>
> *What aligns with SHRM behavioral competencies?*
>
> Name the competency. The answer follows.

### Try a Question widget

> **Try a SHRM-CP question:**
>
> (Illustrative — not from any real exam.) A high-performing manager is consistently late submitting performance reviews. Her director defends her — "she's a top producer, leave her alone." What does HR do?
>
> A. Defer to the director and let it go
> B. Escalate to the CHRO
> C. Coach the director on why timely performance management matters to the org
> D. Document the pattern and address the manager directly
>
> **[Reveal answer]**
>
> → Answer: **C**. The competency being tested is **Consultation** — HR's role is to advise leaders to make better people decisions, not to capitulate (A) or police (D). C demonstrates Consultation most directly. Bloom's level: **evaluate.**
>
> **[Start Free Trial to see more questions like this →]**

### Pricing card

(Verbatim, identical to LP #1 above.)

### FAQ

- **Is this aligned to the current SHRM-CP exam?** Yes — built against SHRM's Body of Applied Skills and Knowledge (BASK) and the nine behavioral competencies.
- **Do you cover situational-judgment questions specifically?** Yes — they're the dominant format and every one is tagged with the competency being tested.
- **How many questions is the Full Mock?** 134 questions in 220 minutes — the same as the actual exam.
- **Do you also have SHRM-SCP?** Not yet. SHRM-CP is fully live; SHRM-SCP is on the roadmap based on user demand.
- **Cancel anytime?** Yes. 7-day trial never charges a card.

### Footer CTA

> Train the reflex the exam actually grades.
>
> **[Start Free Trial]**
>
> *7-day free trial. No credit card. Cancel anytime.*

---

## QA checklist before any LP goes live

> **Status, audited 2026-05-11:** the 4 items I (Claude) can verify in the source files are checked off. The 3 deployment-blocked items remain open — tracked in [`06-engineering-handoff.md`](./06-engineering-handoff.md) §1–§3.

- [ ] **Confirm route exists in `web/src/` and is reachable** — *blocked on engineering. Owner: Dave's team. Tracked in `06-engineering-handoff.md` §1.*
- [ ] **Confirm GA4 + Meta Pixel + LinkedIn Insight + Google Ads conversion tags fire on `signup_complete` from each LP** — *blocked on engineering. Tracked in `06-engineering-handoff.md` §2.*
- [x] **Pricing block matches `/pricing` byte-for-byte.** Verified 2026-05-11. Wording adjusted ("5 Questions" not "5 questions/day") to match live page exactly. All feature names, prices, billing terms identical to verified live `/pricing`.
- [x] **"Try a Question" widget questions are original / AI-generated.** All 3 are AI-generated by Claude during this campaign work (not lifted from any third party), and each is explicitly tagged `(Illustrative — not from any real exam.)` directly above the question. Tested archetypes (stakeholder scope-change for PMP, integrity-vs-confidentiality for Sec+, performance-management for SHRM-CP) are common scenario shapes, but specific wording and answer choices are original.
- [ ] **Hero loads without layout shift on mobile (Tailwind responsive check)** — *blocked on engineering. Requires LPs deployed. Tracked in `06-engineering-handoff.md` §1.*
- [x] **Universal CTA button text is literally "Start Free Trial".** 16 occurrences across the file, all "Start Free Trial". Zero variants ("Try CipherExam", "Sign Up", "Get Started", "Join") found.
- [x] **FAQ specs match the verified `cipher-exam-context` skill.** Diffs:
  - PMP Full Mock: claim **180 questions / 230 minutes** ✓ matches verified exams.ts
  - Sec+ Full Mock: claim **90 questions / 90 minutes** ✓ matches verified exams.ts
  - SHRM-CP Full Mock: claim **134 questions / 220 minutes** ✓ matches verified exams.ts
  - Network+ availability: claim "fully live with PBQ support" ✓ matches verified live cert list
  - CAPM "not yet" for PMP: ✓ accurate (not in verified live list)
  - SHRM-SCP "not yet" for SHRM-CP: ✓ accurate
  - **EMV in Sec+ FAQ**: was ~~"CySA+ is on the roadmap"~~ → corrected to "CISSP is on the roadmap" (CISSP is verified in the "Coming soon" list; CySA+ is not).
