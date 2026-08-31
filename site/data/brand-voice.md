# CipherExam Brand Voice — Rubric

Source of truth for tone, vocabulary, and voice rules. Both `draft-week-posts` (constraints) and `post-performance-grader` (rubric input under "what worked / didn't") read this file every run.

Extracted from `cipher-exam-context` skill on 2026-05-25. When voice rules change, update this file — not the audit report `05-brand-voice-check.md` (which is a historical artifact, do not consume).

---

## Voice register

- **Founder voice** ("I", "Dave") — `/story`-adjacent content, LinkedIn personal posts, founder VO, blog signatures.
- **Product voice** ("we") — ads, landing pages, in-app copy, email, X posts that aren't first-person.
- **Plain-spoken, slightly weary-of-bad-prep-tools.** Confident without hype. Reading level 8th–10th grade. Short sentences. Concrete cert names + question types over abstract claims.
- **Canonical founder line:** "The exam stops feeling like a trick." Use sparingly; do not paraphrase into weaker variants.

---

## Approved frames (lean on these)

- "Learn how certification exams think" (hero promise)
- "Reasoning, not memorization"
- "The mindset behind the questions"
- "Thinking patterns, not just answers"
- "Exam Lens" — the umbrella brand term for per-exam metacognitive frameworks. Never expose internal lens names (PMI Decision Lens, Security Triad Lens, etc.) in customer-facing copy.

---

## Hard bans (BLOCK — never publish)

- "Crush / dominate / smash" or any combat metaphor
- "Guaranteed pass" / "Pass guaranteed" / "100% pass rate" — legal + credibility risk
- "Game-changer / revolutionary / unleash / unlock your potential" — generic SaaS-speak
- Invented urgency or scarcity — no "first 500", no "limited spots", no countdown not tied to a real event
- Invented pricing — no lifetime tier, no $99 deal, no caps. Real pricing only: Starter $0, Pro $19/mo, yearly saves 17%, 7-day free trial, no credit card.
- Named-competitor comparisons in **ads or LP copy** (mentioning them in Reddit value-posts or in the brief itself is fine; ads stay clear-not-clever)
- Lifted phrases from competitor copy (borrow structure only — see `cipher-exam-context` → "Competitor counter-tactics")
- First-person exam-taking voice ("when I sat for the PMP…") — Dave didn't, don't fake it
- **British spelling.** US spelling everywhere, no exceptions (Dave, 2026-08-31). `memorized` not `memorised`; also recognize, organize, prioritize, summarize, analyze, minimize; `practice` for both noun and verb (never `practise`); behavior/favor/honor; canceled, modeling, labeled; defense, license; toward/backward (no trailing `s`). The audience is US-based PMP and Security+ candidates and PMI's own material is US-spelled — a British spelling reads as not-from-here, which is fatal in a comment whose whole job is to sound like a peer in that room. It slips in most easily in long reasoning sentences, which is exactly the register the LinkedIn comment drafts use.

---

## Soft constraints (WARN — fix unless founder-overridden)

- "Cipher/decode" wordplay: **maximum one per post**, prefer zero. The site itself uses it once total (title tag).
- Sentences > 25 words — break them up
- More than 2 hashtags on LinkedIn, more than 1 on X
- Stacked superlatives ("incredibly powerful next-gen AI") — pick one or none
- Em-dashes more than 3 per LinkedIn post / 1 per X post (Dave's voice uses them, but over-use reads as AI)
- CTA copy other than "Start Free Trial" or "Start your 7-day trial" — variants dilute the universal CTA
- Long preambles before the hook — the first line must do work

---

## CTA + offer (use verbatim)

- **Universal CTA:** "Start Free Trial"
- **Trial details:** "7-day free trial. No credit card required. Cancel anytime."
- **Pricing if mentioned:** "$19/month, or $189/year (save 17%)"
- **Link format on X:** must include `https://` scheme (bare domains break auto-linking — see memory `feedback_x_links_need_https.md`)

---

## Voice-specific channel rules

### LinkedIn (founder voice OK)

- 4–8 short paragraphs, em-dashes for asides, asterisks for *emphasis*
- 2–3 hashtags max (exam-relevant: #PMP, #ProjectManagement, #SecurityPlus, etc.)
- First-person "I built / I noticed / I'm hearing from" is good
- End with one CTA line

### X (product voice usually)

- 3–5 short lines max
- 1 hashtag max
- `https://` on the CTA URL (no bare domains)
- No threading unless the hook genuinely needs more than the character window

### Reddit organic

- Value-first body, **no CTA link in body** (gets AutoMod-removed on most prep subreddits)
- Link only on request in a reply comment, and only if subreddit rules allow
- Sign with "(I build a tool in this space, happy to share if useful)" only if mods explicitly allow
- Match subreddit timezone (r/pmp peaks 9–11am ET, r/CompTIA 10am–1pm ET, r/humanresources 8–10am ET)

### Reddit Ads

- Native-style copy (reads like a Reddit comment, not display ad)
- First line is everything — banner-blindness is faster than LinkedIn/X
- CTA in body is fine here (paid surface)

---

## Testimonial usage (Markus Kopko)

- ✅ PMP / Sec+ / SHRM-CP surfaces, founder LinkedIn posts, credibility content
- ⚠️ Lead with the credential: "PMI AI Standards Core Team Member" — not "PgMP holder"
- ❌ Do NOT use on PgMP surfaces or paired with anti-PgMP-competitor copy
- 🔄 Cap at 3 active paid placements; rotate in other testimonials once collected

Full context in `cipher-exam-context` → "Canonical testimonial".

---

## Grader rubric — brand-voice fit

When grading a published post under "what worked / didn't", check brand-voice fit alongside the engagement-rate analysis. Surface fit issues in `gradeNotes` only when they're load-bearing (i.e., they plausibly contributed to the grade).

**Score brand-voice fit as one of:**

- **Tight** — register matches channel, no bans, frames used naturally → no comment
- **Loose** — one or two WARN-level slips (extra em-dashes, mild wordplay over-use) → mention briefly if engagement underperformed
- **Off** — any BLOCK-level violation, OR multiple WARNs, OR wrong voice register (founder voice where product voice belonged) → call out explicitly in `gradeNotes` as a likely contributor to the grade; recommend a voice fix in `recommendations`

Brand-voice fit alone does not change the letter grade — that's driven by metrics. But a post that bombed AND was off-brand gets the brand-voice critique as the primary takeaway, because the metrics signal is muddied by the off-brand variable.

---

## When to update this file

When a voice rule changes (Dave coins a new approved frame, retires an old one, locks a new ban), update this file directly — do not edit `cipher-exam-context` as the primary source and let this file drift. The reverse is also true: if `cipher-exam-context` learns a new voice fact that should apply to drafting/grading, mirror it here.

Keep this file under 150 lines. If it grows past that, the drafter/grader will start truncating it. Move encyclopedia-style content back to `cipher-exam-context`; keep this file rubric-shaped.
