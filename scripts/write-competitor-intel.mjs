#!/usr/bin/env node
// Writes pre-generated competitor intel to Firestore via REST API.
// Run: node scripts/write-competitor-intel.mjs

const PROJECT = 'cipher-marketing-daveq';
const API_KEY = 'AIzaSyDDSPC14tdDzMfkDrYLFykg2CFOZK9B4Ts';
const BASE    = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/competitor_intel`;

const GENERATED_AT = new Date().toISOString();

// ── Content ────────────────────────────────────────────────────────────────

const BATTLECARD = `## Competitive Intel: Positioning Battlecard

*CipherExam vs. the Memorization-Loop Category — Pocket Prep · Examzify · MeasureUp*

---

### Point 1 — The loop vs. the lens

**Their pitch:** More questions = more prep. Grind until it sticks.

**The gap:** The memorization loop has no mechanism for the actual failure mode. Test-takers don't fail because they don't know the content — they fail because they pick the *almost-right* answer. None of these tools explain why B looked so convincing.

**Your angle:**
> *"Most cert prep tools teach you answers. CipherExam teaches you to think like the exam committee."*

---

### Point 2 — They fix knowledge gaps. You fix reasoning traps.

**Their pitch:** Full question banks, domain coverage, streak tracking.

**The gap:** None of them explain *why B looked right*. That's the only thing that matters when you're staring at a trick question at hour 3 of the PMP exam.

**Your angle:**
> *"You've seen this topic. You know the material. You still picked B. That's not a knowledge gap — that's a reasoning trap. CipherExam is built for that."*

---

### Point 3 — Volume for students, efficiency for professionals

**Their pitch:** Optimized for grinding (500+ questions, leaderboards, streaks).

**The gap:** Working professionals can't do 800 questions hoping pattern-matching kicks in. They need fewer reps with deeper insight, not more of what already failed them.

**Your angle:**
> *"You don't have time to grind 800 practice questions. CipherExam explains the trap in 30 seconds so you don't fall for it on exam day."*

---

## Category Creation Angle

Don't position CipherExam as "another practice test." Own a new category:

**"Exam reasoning trainer"** — the first tool built for *how* working professionals fail, not what they don't know.

Landing page / ad copy: *"Not a question bank. An exam reasoning trainer."*

---

## Recommended Actions

1. **This week's post hook:** Lead with the reasoning trap angle — *"You failed because you knew too much, not too little"* — then explain the distractor concept. No competitor can say this.
2. **Landing page:** Replace any "practice questions" language with "exam reasoning training." Add a subhead: *"Built for the trap, not the topic."*
3. **Ad copy split test:** Run "question bank vs. reasoning trainer" as a headline test against the PMP audience on LinkedIn. The category contrast does the positioning work without naming competitors.`;

const DEEPDIVE = `## Competitive Intel: Pocket Prep — Deep Dive

*Pocket Prep is the highest-threat competitor for CipherExam's mobile-first, time-poor professional audience.*

---

### Their Positioning

Pocket Prep markets itself as the fastest way to pass certification exams using short daily practice sessions. Their pitch is simplicity: open the app, answer questions, track your score, pass. Popular with IT certs, nursing, and financial licenses.

**What they claim:** "Study smarter, not harder" — bite-sized practice that fits into your day.

---

### What Their Users Actually Say

- Reviews consistently praise the mobile UX and question volume but complain that explanations are thin or nonexistent.
- A recurring complaint: "I got the right answer but I still don't understand *why*." This is the exact reasoning trap CipherExam solves.
- Failing users report memorizing answers without understanding them, then blanking on novel question phrasings in the actual exam.
- No adaptive routing — you keep seeing the same question types regardless of where you're weak.

---

### 3 Weaknesses to Exploit

**1. Explanation gap.** Pocket Prep's explanations, when they exist, tell you what the right answer is — not why the wrong answers were designed to fool you. CipherExam's Exam Lens targets this directly.

**2. Memorization loop, not reasoning training.** Their gamified streaks reinforce repetition, not understanding. A candidate who can ace Pocket Prep's question bank may still fail the real exam on a rephrased question.

**3. No AI layer.** Zero personalization. No analysis of your reasoning patterns, no detection of which distractor types catch you. CipherExam surfaces exactly where your reasoning breaks down.

---

### What Pocket Prep Does Better Right Now

- **Mobile UX** is genuinely excellent — lighter and faster than CipherExam's current experience.
- **Question volume** is massive; some certs have 1,000+ questions.
- **Brand recognition** in the IT cert space is strong.

Dave needs to know: on raw question count and app polish, Pocket Prep wins today. CipherExam wins on *why it matters when it's exam day*.

---

### Recommended Post Hook

> *"Pocket Prep will tell you the right answer. It won't tell you why you almost picked B — which is the only question that matters on exam day."*

---

## Recommended Actions

1. **Post angle:** "I got every practice question right and still failed." Lead with the failure mode story, pivot to the reasoning trap explanation, close with CipherExam. Targets PMP and Security+ audiences who've already tried Pocket Prep.
2. **Landing page:** Add a comparison callout: "Question banks show you right answers. CipherExam shows you why wrong answers look right." No brand names needed.
3. **Reddit play:** In r/pmp and r/CompTIA, answer questions about "why did I fail after all that studying?" — genuine help, no hard sell, link to the Exam Lens explainer when relevant.`;

const LANDSCAPE = `## Competitive Intel: Full Landscape Scan

*Top 5 threats to CipherExam ranked by likelihood of capturing Dave's core audience — working professionals preparing for PMP, Security+, and SHRM-CP.*

---

### 🔴 Threat 1 — Pocket Prep

**Their pitch:** The fastest mobile study app. Short sessions, huge question banks, streak tracking.

**The gap:** No meaningful explanations. Users memorize answers, not reasoning. Consistently fails on novel question phrasings in real exams. Zero AI layer.

**Your angle:** *"Pocket Prep trains you to recognize patterns. CipherExam trains you to think."*

---

### 🔴 Threat 2 — Examzify

**Their pitch:** Clean, modern cert prep for IT professionals. Strong Security+ and cloud cert coverage.

**The gap:** Fully static — same questions, same explanations, no adaptation. No AI, no distractor analysis. Popular but commoditized; users can't distinguish it from any other question bank.

**Your angle:** *"Examzify shows you the exam. CipherExam shows you how to read it."*

---

### 🔴 Threat 3 — Kaplan IT

**Their pitch:** Brand authority. Official-feeling prep with Security+ stronghold. Trusted name.

**The gap:** Expensive, old-school UX, no AI. Trades on brand name, not product quality. Users report outdated content and rigid delivery. The "safe" choice for corporate-sponsored study — not for self-directed professionals.

**Your angle:** *"Kaplan charges premium for a 2010 experience. CipherExam is built for 2026 exam formats."*

---

### 🟡 Threat 4 — MeasureUp

**Their pitch:** Official practice tests. Closest simulation of the real exam environment.

**The gap:** Purely transactional — no explanations, no learning, just scoring. Expensive for what it delivers. Best used as a final-week benchmark, not a training tool. Serves a different use case than CipherExam.

**Your angle:** *"Use MeasureUp to test yourself on the last day. Use CipherExam to actually prepare."*

---

### 🟡 Threat 5 — Magoosh

**Their pitch:** Video-first learning with strong GMAT/GRE pedigree. Polished, trusted brand.

**The gap:** Thin cert coverage — PMI and SHRM are afterthoughts. Built for academic exams, not professional certifications. Working professionals find the pace slow and the content misaligned with how cert exams actually ask questions.

**Your angle:** *"Magoosh is great for the SAT. Your PMP is a different animal."*

---

## Recommended Actions

1. **This week:** Build a short LinkedIn post for each of the top 3 — one sentence on their gap, one sentence on CipherExam's fix. Don't name them; describe the category failure. Pocket Prep = "the app that trains muscle memory, not reasoning." Examzify = "the tool that gives you the question, never the trap."
2. **Landing page:** Add a "Why CipherExam?" section using the category framing — *"Other tools teach you what to answer. CipherExam teaches you how to think."* Positions against all three without mentioning names.
3. **Organic search:** Create a blog post titled "Why professionals fail PMP after scoring high on practice tests" — targets the exact failure mode none of these competitors address, and ranks for high-intent searches.`;

// ── Helpers ────────────────────────────────────────────────────────────────

function firestoreDoc(content) {
  return {
    fields: {
      content:      { stringValue: content },
      generated_at: { stringValue: GENERATED_AT },
    }
  };
}

async function write(docId, content) {
  const url = `${BASE}/${docId}?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(firestoreDoc(content)),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to write ${docId}: ${res.status} ${txt}`);
  }
  console.log(`✓ wrote ${docId}`);
}

// ── Main ───────────────────────────────────────────────────────────────────

await write('battlecard', BATTLECARD);
await write('deepdive',   DEEPDIVE);
await write('landscape',  LANDSCAPE);

console.log(`\nAll 3 reports written to Firestore (${GENERATED_AT})`);
