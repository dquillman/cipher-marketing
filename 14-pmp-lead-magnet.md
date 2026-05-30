# 14 — PMP Lead Magnet (board todo #2, PMP cluster)

> **Shipped 2026-05-28.** Free PDF lead magnet (PMP Exam Lens Cheat Sheet) + email-capture form on `/lp/pmp` + Cloud Function backend. Addresses board feedback that prospects who won't trial yet might give email today, opening a separate funnel layer.

## What changed

| Layer | Before | After |
|---|---|---|
| PMP LP | Trial-only CTA (signup → 14-day trial) | Trial CTA + email-capture form returning a free PDF download |
| Backend | n/a | `captureLead` Cloud Function — writes to Firestore `leadCaptures`, returns download URL |
| Content | n/a | 11-page "PMP Exam Lens Cheat Sheet" — the lens, 5 worked scenarios, 4 trap types, CTA |
| Storage | n/a | PDF lives at `web/public/lead-magnets/pmp-exam-lens-cheat-sheet.pdf` → deployed with hosting |

## Files

**New (4):**
- `cipher-marketing/lead-magnets/pmp-exam-lens-cheat-sheet.md` — source content
- `Cipher/functions/src/captureLead.ts` — Cloud Function (callable, validates email + cluster, writes Firestore)
- `Cipher/web/src/components/LeadMagnetCapture.tsx` — drop-in capture form with success state
- `cipher-marketing/14-pmp-lead-magnet.md` — this file

**Modified (2):**
- `Cipher/functions/src/index.ts` — added `export { captureLead } from './captureLead';`
- `Cipher/web/src/pages/landing/PmpPracticeLP.tsx` — wired `<LeadMagnetCapture cluster="pmp" ... />` between testimonials and pricing

## Two manual steps before deploy

### Step 1 — Generate the PDF

The cheat-sheet content lives at `cipher-marketing/lead-magnets/pmp-exam-lens-cheat-sheet.md`. Convert to PDF using whichever you have installed:

**Option A — Pandoc (recommended, best output):**
```powershell
cd G:\Users\daveq\cipher-marketing\lead-magnets
pandoc pmp-exam-lens-cheat-sheet.md -o pmp-exam-lens-cheat-sheet.pdf --pdf-engine=xelatex -V geometry:margin=1in -V fontsize=11pt --variable mainfont="Satoshi" --variable monofont="JetBrains Mono"
```

**Option B — Typora / Mark Text / Obsidian** — open the .md file, File → Export → PDF.

**Option C — VS Code with "Markdown PDF" extension** — `Ctrl+Shift+P` → `Markdown PDF: Export (pdf)`.

**Option D — Online (no install)** — paste the markdown into <https://md-to-pdf.fly.dev/> and download.

Aim for ~11 pages at standard print size. If yours comes out at 14+ pages, drop the front-matter block at the top of the .md.

### Step 2 — Drop the PDF into the web project's public folder

```powershell
mkdir G:\Users\daveq\Cipher\web\public\lead-magnets
copy G:\Users\daveq\cipher-marketing\lead-magnets\pmp-exam-lens-cheat-sheet.pdf G:\Users\daveq\Cipher\web\public\lead-magnets\
```

The PDF needs to land at the URL `https://cipherexam.com/lead-magnets/pmp-exam-lens-cheat-sheet.pdf` (which is what the Cloud Function returns). Vite copies `public/` into `dist/` verbatim on build, so it'll just work.

## Deploy

After steps 1–2:

```powershell
# Functions (new captureLead endpoint)
cd G:\Users\daveq\Cipher
firebase deploy --only functions:captureLead

# Web (LP wiring + PDF asset)
cd G:\Users\daveq\Cipher\web
npm run build
cd ..
firebase deploy --only hosting:production
```

## Smoke test (post-deploy)

1. Open `https://cipherexam.com/lp/pmp` in an incognito window.
2. Scroll past the testimonials to the lead-magnet block. Confirm:
   - "Free: The PMP Exam Lens Cheat Sheet" headline renders
   - Email input + "Get the cheat sheet" button visible
3. Enter `test+pmp@daveq.dev` (or any real email of yours) → submit.
4. Confirm:
   - Success state appears with "Download the PDF →" button
   - Clicking it downloads/opens the actual PDF
   - Firestore `leadCaptures/test+pmp@daveq.dev__pmp` doc exists with the UTM bag
5. Open the funnel.html dashboard — you should see signups bump by 1 on a future deploy. (Lead captures aren't yet wired into the funnel — see "Open work" below.)

## What's in the PDF

11 sections, all original — no copyrighted PMBOK material lifted:

1. Cover + intro
2. "The Lens, in one sentence" — *what would PMI want you to do?*
3. The Bloom's layer — why memorization fails at Evaluate-level questions
4. Scenario 1: Stakeholder pressure on Friday afternoon
5. Scenario 2: Vendor missed a milestone
6. Scenario 3: EMV math with a lens twist
7. Scenario 4: Team member missing standups
8. Scenario 5: A risk that just escalated
9. The 4 PMP trap types (act-before-analyze, process-as-shield, skip-the-stakeholder, disproportionate response)
10. Your next move (CTA to /lp/pmp with UTM `lead-magnet`)
11. Sign-off

Each scenario follows the same structure: question → 4 options → lens applied to each → winner explained. Reading time: ~15 minutes. Reflex-building requires the CipherExam product, which is the CTA.

## Architecture choices

### Why a separate Cloud Function for capture
Could have done it client-side directly to Firestore with `addDoc`, but that exposes the collection to arbitrary writes and makes rate-limiting harder. The callable function gives us server-side validation + auth context + future drip-email hooks for ~30 lines of code.

### Why hard-code PDF URLs per cluster (not signed URLs)
The PDFs are intentionally public — the marketing claim is "free, no trial required." Anyone with the URL can download. Signed URLs add complexity and break sharing. Logged email captures still let us drip-email people who downloaded; the PDF being shareable is a feature.

### Why upsert (not unique-create) on duplicate captures
Same email + cluster combination overwrites the prior record's timestamps. Means a prospect who downloads twice is logged once with the most recent UTMs — no duplicate rows, fresh attribution.

### Why one component for all 3 clusters
The `LeadMagnetCapture` takes `cluster` + `headline` + `sub` as props. PMP LP wires it now; Sec+/SHRM-CP wire it later with their own copy + PDF. Zero rework when those clusters land.

## Open work (deferred from this pass)

- **Drip email** — captureLead writes to Firestore but doesn't send a welcome email yet. Hook into Resend/SendGrid when the volume justifies it (Resend free tier handles 3000/mo).
- **Funnel integration** — `metrics.funnel.signups` doesn't currently count lead captures. When ready, decide whether to add a new "leadCaptures" stage to the diagnostic or roll them into signups.
- **Sec+ + SHRM-CP variants** — content + component wiring is identical; just need the PDFs and the LP edits.
- **Rate limiting on captureLead** — currently anyone can spam-submit. Add Firestore-based rate limit when bot traffic appears (no signal yet).
- **A/B headline test** — the current headline "Free: The PMP Exam Lens Cheat Sheet" is a guess. Once 50+ captures land, A/B vs. "5 worked PMP scenarios that crack the test pattern."

## Rollback

If the form is broken or the PDF leaks something:

```powershell
cd G:\Users\daveq\Cipher
git revert <commit>
cd web && npm run build && cd ..
firebase deploy --only hosting:production,functions:captureLead
```

The Firestore `leadCaptures` collection survives revert (just stale data). No user-facing harm — the page goes back to trial-only.
