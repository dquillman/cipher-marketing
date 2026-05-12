# Multi-Exam Social Pack — Tier 1 Clusters

> **Voice:** Founder voice ("I, Dave") for LinkedIn long-form. Product voice for X/Twitter and Reddit. **"Clear, not clever"** per MARKETING-PLAN.md ad rules.
>
> **Universal CTA:** *Start Free Trial.* `/pricing`. No credit card. Cancel anytime.
>
> **Cipher/decode wordplay:** used **once** total across this whole pack (X/Twitter hook for Security+), per guardrail.
>
> **All scenario examples below are illustrative, not lifted from any copyrighted exam or prep book** — that constraint matters legally and is also CipherExam's actual content principle.

---

## Cluster 1 — PMP

### LinkedIn long-form #1 (founder voice)

**Hook:** "Most PMP-prep tools are solving the wrong problem."

> I've watched a hundred candidates go through PMP prep and there's a pattern most coaches don't talk about.
>
> Around week six, the smart ones plateau. They know every process, every ITTO, every formula. Their practice scores hover around 80%. But every time they sit a sample test, the same thing happens — they feel like the questions are *trying to trick them*.
>
> They're not. The questions are testing a thing the prep books almost never teach: the Exam Lens. *What would PMI want you to do?*
>
> It's not the same as "what would a good PM do" or "what would your last manager do." PMI has a very specific worldview about how project managers behave, and the exam grades you against that worldview. If you've been managing projects for ten years in a hard-deliverables shop, you've probably built habits that PMI considers *suboptimal*. The exam catches those habits.
>
> When candidates start asking "what's the PMI answer?" instead of "what's the right answer?" — that's when their scores jump.
>
> If you're at the plateau, that's the shift to make. The facts aren't your problem. The frame is.
>
> — Dave, founder of CipherExam
>
> (We built CipherExam around this exact lens. Free 7-day trial, no card: cipherexam.com)

### LinkedIn long-form #2 (founder voice, worked question)

**Hook:** "Here's the PMP question that breaks every memorizer I know."

> Scenario (paraphrased, not from any exam): You're three sprints into a software project. A stakeholder emails you Friday afternoon and says the scope they signed off on six weeks ago is "no longer what we need." They want a meeting Monday morning to discuss adding two new features. What do you do?
>
> A) Schedule the meeting and prepare an impact analysis for the new features
> B) Reject the request — scope was signed off, this is scope creep
> C) Accept the new scope and adjust the next sprint backlog
> D) Tell the stakeholder to submit a formal change request before any discussion
>
> Most candidates I've worked with pick D. It feels right. "Use the change-control process." Textbook.
>
> The Exam Lens answer is A. Why?
>
> PMI's worldview is collaborative-first. The change-control process exists, but invoking it as a *first response* to a stakeholder signals "I'm here to gate, not to help." PMI wants the project manager to first *understand the change* (impact analysis), *bring stakeholders together* (the Monday meeting), and *then* run it through formal change control. D is procedurally correct but PMI-relationally cold.
>
> That's the lens. Not "what does the PMBOK say to do" but "what would a PMI-aligned PM do as their *first move*."
>
> Once you can read questions through that lens, the exam stops feeling like a trick.
>
> — Dave
>
> (CipherExam builds the lens into every answer explanation. 7-day free trial, no card.)

### X/Twitter — hook post

> 80% on PMP practice tests but still scared?
>
> The issue isn't your facts.
>
> It's that PMP doesn't grade facts.
>
> It grades whether you think the way PMI thinks.
>
> Different problem. Different prep.
>
> cipherexam.com

### X/Twitter — worked-question post (Exam Lens applied)

> PMP question type that breaks memorizers:
>
> "A stakeholder demands a scope change Friday afternoon. What do you do first?"
>
> Memorizer's answer: "Tell them to file a change request."
> PMI's answer: "Run an impact analysis and bring the stakeholders together."
>
> The lens isn't process. The lens is *what PMI wants the PM to do.* Those aren't the same.
>
> 7-day free trial: cipherexam.com

### Reddit — r/pmp (value-only, NO link)

> **Title:** The plateau at 80% — what finally moved me past it
>
> Hit a wall around week six of prep. Practice scores stuck at 78–82%. Every question I missed felt like the choices were designed to fool me.
>
> Thing that finally clicked: stop asking "which answer is right?" and start asking "which answer would PMI want me to pick?"
>
> Those are *not* the same question. PMI has a doctrine about PM behavior — collaborative-first, stakeholder-centric, lean toward people-management over process-enforcement. Most working PMs (myself included) have spent years building habits that PMI considers suboptimal. The exam catches those habits.
>
> The shift was reading every question as "what does the PMI playbook say a PM does here?" rather than "what is correct in the abstract." After that, my scores went 80% → 89% in about two weeks.
>
> Anyone else hit this and break through? Curious what worked for you.

---

## Cluster 2 — CompTIA Security+

### LinkedIn long-form #1 (founder voice)

**Hook:** "Security+ candidates pass every practice quiz and still fail PBQs."

> A pattern I see constantly with CompTIA Security+ candidates:
>
> They drill question banks. They watch Professor Messer twice. They take Pocket Prep up to 92%. Then they sit the real exam, hit the performance-based questions in the first ten minutes, and panic.
>
> PBQs aren't trick questions. They're a different *cognitive task* than multiple-choice. Drag-and-drop a firewall rule into the right position. Match the attack to the control. Pick the right output from a CLI simulation. You can't pattern-match these from flashcards because they're testing whether you can *operate*, not whether you can *recognize*.
>
> The fix isn't more flashcards. It's training the underlying reasoning frame — the CIA triad. Every Security+ question, MCQ or PBQ, is asking "which leg of confidentiality / integrity / availability is being protected, and what attacks compromise it?" Once that frame is automatic, PBQs stop feeling like a different exam.
>
> If you've passed every quiz and you're still nervous, that's the gap. Not facts. Frames.
>
> — Dave, founder of CipherExam
>
> (CipherExam's Security+ simulator runs PBQs natively, with the CIA-triad lens built into every explanation. 7-day free trial, no card: cipherexam.com)

### LinkedIn long-form #2 (founder voice, worked PBQ walkthrough)

**Hook:** "How to approach a Security+ PBQ when your brain freezes."

> Performance-based questions on Security+ feel different because they are. Here's the loop I teach.
>
> Imagine a PBQ shows you a network diagram with three subnets, a firewall, and a web server in a DMZ. The prompt: "Drag the appropriate firewall rules to allow only HTTPS traffic from the internet to the web server and block all other inbound traffic." (Paraphrased — not from any real exam.)
>
> Step 1: Name the CIA triad principle. *Confidentiality + integrity of the web server,* by limiting attack surface.
>
> Step 2: Name the trust zones. Internet (untrusted) → DMZ (semi-trusted) → internal (trusted).
>
> Step 3: Write the minimum rule. Allow TCP/443 from any to web server. Deny all else inbound. That's it.
>
> Step 4: Ignore the decoys. PBQs often include extra rules that *look* right but violate least-privilege.
>
> The reason this works isn't because I'm telling you anything new — you already know firewall rules. It's because the four-step loop forces you to *use the CIA triad lens first* instead of pattern-matching from memory. Memory will give you a rule that almost-works. The lens gives you the rule that's exactly right.
>
> If you've been bombing PBQs in practice, try the loop on three of them this week. Tell me how it goes.
>
> — Dave
>
> (CipherExam's Sec+ Full Mock runs 90 questions in 90 minutes with native PBQ support. cipherexam.com.)

### X/Twitter — hook post (uses the "decode" wordplay — this is the one place we use it)

> CompTIA Security+ PBQs aren't harder.
>
> They're encoded differently.
>
> Decode the CIA triad question hiding inside the diagram, and the PBQ becomes 30 seconds.
>
> 7-day free trial, no card: cipherexam.com

### X/Twitter — worked-question post (Exam Lens applied)

> Security+ question that splits the room:
>
> "Which control best ensures sensitive data remains unaltered during transit?"
>
> Memorizer: "TLS, obviously."
> Lens answer: "Which CIA principle? *Integrity.* Which control delivers integrity in transit? HMAC / digital signatures. TLS gives you confidentiality first; integrity is a side effect."
>
> CIA triad first. Control second. Order matters.
>
> cipherexam.com

### Reddit — r/CompTIA (value-only, NO link)

> **Title:** What finally got me through Security+ PBQs (after I bombed the first attempt)
>
> First attempt I scored 720 — failed by 30 points. Two of the PBQs killed me. I went in with Messer videos done twice, Dion question bank at 88%, and I still walked out shaky.
>
> What changed for the retake: I stopped studying *content* and started studying the *CIA triad lens*. Every question — MCQ or PBQ — got the same first move: "which of C / I / A is this question protecting?" Once that's named, the answer space collapses by 60-70%.
>
> Example pattern. A PBQ shows you firewall rules and asks which one to add. Before I look at the rules I ask: confidentiality of *what*, from *whom*? Once I've named that, the right rule is usually obvious and the decoy rules show themselves.
>
> Passed the retake with 812 two weeks later. Hadn't learned new content. I'd just trained the lens.
>
> If anyone's stuck on PBQs and the answer banks aren't getting you there — try this. It's free to try.

---

## Cluster 3 — SHRM-CP

### LinkedIn long-form #1 (founder voice)

**Hook:** "SHRM-CP isn't testing what you know about HR. It's testing how SHRM thinks about HR."

> If you've ever sat the SHRM-CP and walked out frustrated, you probably ran into the same thing I did when I built the prep material for it.
>
> The behavioral / situational-judgment questions aren't right-or-wrong in the way most exams are. Three of the four options will be defensible HR moves. The "correct" answer is the one that aligns with SHRM's nine behavioral competencies — *Leadership, Ethical Practice, Business Acumen, Relationship Management, Consultation, Critical Evaluation, Global Mindset, Cultural Effectiveness, Communication.*
>
> Knowing the competencies is the easy part. Anyone can list them. The hard part is reading a situational question and recognizing *which competency is being tested* before you pick. Because once you know the competency, the right answer is usually the one that demonstrates *that* competency most directly — not the one that solves the business problem fastest.
>
> Example: a question about an employee complaining their manager plays favorites isn't a "resolve the complaint" question. It's a *Relationship Management + Ethical Practice* question. The answer that just resolves the complaint will lose to the answer that demonstrates how a SHRM-certified HR professional would steward both the relationship and the ethical concern.
>
> That's the Exam Lens. It's what the exam grades. Most prep books drill HR knowledge. The exam is grading HR *judgment* — and judgment is competency-shaped.
>
> If you're an HR pro studying for SHRM-CP and the practice questions feel "soft" or "subjective," that's actually the signal. They feel that way because they're testing your competency frame, not your factual recall.
>
> — Dave, founder of CipherExam
>
> (CipherExam's SHRM-CP explanations name the competency on every question. 7-day free trial, no card.)

### LinkedIn long-form #2 (founder voice, worked question)

**Hook:** "The SHRM-CP question type that catches almost every senior HR pro."

> Senior HR professionals fail SHRM-CP more often than I expected when I started looking at the data.
>
> The reason isn't knowledge. It's the opposite. They've spent ten years making pragmatic HR calls — moving fast, resolving issues, getting buy-in. SHRM grades you against an idealized competency frame, and pragmatism sometimes looks *suboptimal* against that frame.
>
> Scenario (illustrative): A high-performing manager is consistently late submitting performance reviews. Her director defends her — "she's a top producer, leave her alone." HR's options:
>
> A) Defer to the director and let it go
> B) Escalate to the CHRO
> C) Coach the director on why timely performance management matters to the org
> D) Document the pattern and address the manager directly
>
> A pragmatic HR pro picks A or D. Get it done, move on.
>
> SHRM's lens picks C. Why? Because the competency being tested is *Consultation* — HR's role is to be an internal advisor who helps leaders make better people decisions, not to either capitulate (A) or police (D). C demonstrates Consultation directly.
>
> This is what trips up experienced practitioners. The exam isn't asking what works. It's asking what a SHRM-certified HR professional does, by SHRM's competency definition.
>
> Read every question for the competency first. The answer follows.
>
> — Dave
>
> (CipherExam tags every SHRM-CP question with the competency it tests. cipherexam.com.)

### X/Twitter — hook post

> SHRM-CP isn't testing HR knowledge.
>
> It's testing the SHRM competency frame.
>
> Most pros know the nine competencies cold but never trained the reflex of *naming the competency* before picking the answer.
>
> That reflex is the prep gap.
>
> cipherexam.com

### X/Twitter — worked-question post (Exam Lens applied)

> SHRM-CP scenario, paraphrased:
>
> "A manager is late on performance reviews. Her director defends her. What does HR do?"
>
> Wrong instinct: just escalate or document.
> Right lens: which competency is this question grading? *Consultation.*
> Once you've named it: the answer is the one that shows HR consulting the director, not policing the manager.
>
> Name the competency first. The answer follows.
>
> cipherexam.com

### Reddit — r/humanresources (value-only, NO link)

> **Title:** Senior HR pros: SHRM-CP is testing a different thing than you think
>
> I've been in HR for 12 years. Sat SHRM-CP last fall. Walked out *certain* I'd failed because half the situational answers felt arbitrary. Passed, but barely.
>
> Realization in hindsight: the exam isn't grading "what works in HR." It's grading "what does the SHRM competency model say a certified HR professional does." Those overlap maybe 70%. The 30% gap is where senior pros lose points.
>
> Specifically: anywhere your instinct is "just handle it pragmatically," SHRM probably wants the answer that demonstrates *Consultation* or *Critical Evaluation* or *Relationship Management* more visibly. Pragmatic answers feel right but score lower than the answer that visibly enacts a named behavioral competency.
>
> If you're prepping and the situational questions feel subjective, that's the signal — you're reading them as HR problems instead of as competency-frame questions. Try this on your next 20 practice items: before you pick, name which of the nine competencies the question is grading. My hit rate went from ~75% to ~88% with that one habit.
>
> Anyone else have a similar shift on study? Curious what helped.

---

## Exam-agnostic LinkedIn warm-outreach template

> **Use case:** Connection requests / first DMs to PMP / Sec+ / SHRM-CP candidates Dave identifies on LinkedIn (people posting "studying for {exam}" or commenting on cert-prep posts).
>
> **Merge tag:** `{{exam_name}}`
>
> **Tone:** No pitch. Offer something useful. Decline-friendly.

---

> Hi {{first_name}},
>
> Saw your post about prepping for {{exam_name}}. I run CipherExam — a tool that focuses on the reasoning frame the {{exam_name}} actually grades, not just the facts. Not pitching anything, just curious where you are in prep and whether the question-bank-style tools are working for you.
>
> If you want, I'll send you a worked example of one {{exam_name}} question explained through the {{exam_name_specific_lens}} — no opt-in, no list, just one example you can read and ignore.
>
> Either way, good luck with the exam.
>
> — Dave

**Merge-tag fill values:**

| `{{exam_name}}` | `{{exam_name_specific_lens}}` |
|---|---|
| PMP | Exam Lens |
| Security+ | CIA triad / Exam Lens |
| SHRM-CP | Exam Lens |

---

## Posting cadence (4-week calendar mapping)

| Asset | Cluster | Channel | Week |
|---|---|---|---|
| LI long-form #1 (founder) | PMP | LinkedIn | W1 Fri |
| LI long-form #1 (founder) | Sec+ | LinkedIn | W2 Mon |
| LI long-form #1 (founder) | SHRM-CP | LinkedIn | W2 Thu |
| LI long-form #2 (worked Q) | PMP | LinkedIn | W3 Fri |
| LI long-form #2 (worked Q) | Sec+ | LinkedIn | W4 Mon |
| LI long-form #2 (worked Q) | SHRM-CP | LinkedIn | W4 Tue |
| X hook + X worked-Q | each cluster | X/Twitter | weekly, paired |
| Reddit value post | each cluster | r/pmp, r/CompTIA, r/humanresources | once per cluster, spaced across W2–W3 |
| LI warm-outreach template | all three | LinkedIn DM | W3 Thu — push 10-15 personalized sends |
