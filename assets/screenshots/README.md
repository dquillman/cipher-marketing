# Screenshot library

Real, unedited screens from the live CipherExam app. Source material for LinkedIn
post cards. Started 2026-08-29 after Dave ran the app as a customer and found the
coaching card ("Your Progress So Far") — the first screen that shows what
CipherExam is instead of describing it.

## Two hard rules

1. **Real and unedited.** Never retouch, never mock up, never rewrite the app's
   words. If the app does not talk like the picture, we lose the signup and the
   trust. See memory: `never-post-canvas-exports`.
2. **Never imply a verified answer key or expert review.** The question bank is
   LLM-generated with no source, reviewedBy, or verified fields. Do not capture
   or caption anything that suggests otherwise. See memory: `bank-is-unverified`.

## Where files go

- `raw/` — straight off the screen, any size. Dump here, no naming ceremony.
- Nothing else ships. Post cards are rendered by
  `scripts/render-post-card.mjs` (1080x1350) and only that output goes to
  LinkedIn.

Naming that helps later: `coach-first-vs-correct.png`, `whytrap-secops.png`.
Describe the *insight on screen*, not the screen name.

## Shot list

Capture screens only CipherExam could produce. Skip anything a competitor also has.

### Tier 1 — the money shots

- [ ] **Coaching card catching a real thinking trap.** Not a quiet run. Miss in
      a deliberate pattern first (see below), then screenshot the card that
      names the pattern back to you.
- [ ] **The "why the wrong answer looks right" explanation.** The moment the app
      explains the trap, not the letter.
- [ ] **Domain breakdown that reads like a diagnosis**, not a scorecard.
- [ ] **Exam Lens**, if it shows reasoning rather than content.

### Tier 2 — supporting

- [ ] Coach answering a follow-up question in plain language.
- [ ] A second coaching card from a different exam, proving it is not one lucky
      output.

### Do not capture

Login, home, plain score screens, question lists, settings. Every competitor has
these. A screenshot of a thing everyone has proves nothing.

## How to make the coach say something sharp

The coach reads your miss pattern. A clean run produces a hedgy card
("no thinking traps were detected... you might benefit from"). That is useless
as an ad. Give it a pattern to find:

- **First-vs-correct:** twice, pick the technically correct action when the
  question asks what to do *first*.
- **Skim-the-stem:** pick the answer that matches a keyword in the stem but
  ignores the constraint in the last sentence.
- **Tool-over-people:** on a process question, pick the tool/document answer
  over the talk-to-the-stakeholder answer.

Run 8-10 questions in one domain so the pattern has room to show up.

## Log

Append a line per capture: date, file, exam, what the screen proves.

| date | file | exam | what it proves |
|---|---|---|---|
