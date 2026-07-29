# CipherExam — Marketing Campaign

Standalone repo for the **CipherExam** (cipherexam.com) multi-exam acquisition campaign. Companion to the product code at [github.com/dquillman/cipher](https://github.com/dquillman/cipher).

## What's in here

- **Campaign source-of-truth** (`*.md`) — brief, cornerstone blog, social posts, onboarding email sequence, landing-page reference copy, brand voice review, engineering handoff
- **Interactive dashboard site** (`site/`) — multi-section SPA with daily todos, KPI cards, scratchpad, JSON state layer
- **Remotion videos** (`videos/`) — 20 rendered MP4s + 12 still-frame PNG ad creatives, in 1:1 / 9:16 / 4:5 LinkedIn-optimised aspects
- **Live campaign state** (`site/data/campaign-state.json`) — single source of truth for activated-user count, blockers, daily log, decisions

## Quick start

```bash
# 1. Install dashboard + Remotion dependencies (one-time)
npm install
cd videos
npm install

# 2. Build the site
cd ..
npm run build

# 3. Run a local server to view it
npm run serve
# Open http://localhost:8766/app.html
```

On Windows, the normal operator workflow requires no terminal: double-click
**`Open Cipher Marketing.vbs`** in this folder. It starts the local server
silently and opens the dashboard in your default browser.

## Operator access

The dashboard is private. Firestore, grading, publishing, and campaign reset
require a signed-in Firebase user with the `marketingAdmin` custom claim.
Private campaign and post data is never embedded in hosted HTML.

Google sign-in is enabled for the Firebase project. On first sign-in, the
authenticated bootstrap function grants the claim only to these verified Google
accounts:

- davequillman@gmail.com
- dquillman2112@gmail.com

All other accounts receive a 403 and remain locked out. The manual
`scripts/grant-marketing-admin.mjs` utility remains available for deliberate
future additions.

Never commit a service-account key. Deploy Firestore rules and the grading
function together after granting the claim, avoiding both lockout and an
anonymous mutation window.


## Daily workflow

Double-click **`Open Cipher Marketing.vbs`**. Do not open `site/app.html`
directly: browsers block its campaign-data requests when an HTML file is opened
with a `file:///` address. The **Today** tab then shows the current recommended
marketing action and campaign status.

When you paste an update into Claude Code, Claude updates `site/data/campaign-state.json`, mirrors it to authenticated Firestore, and runs `npm run build`. `site/app.html` is canonical and the build validates it without overwriting it.

## Tier 1 campaign clusters

- **PMP** — composite 25 — PMI Decision Lens reasoning, EMV math support, 180-question Full Mock
- **CompTIA Security+** — composite 25 — native PBQ simulation, CIA-triad framework
- **SHRM-CP** — composite 23 — behavioral competency lens, highest wedge-fit per CAC dollar

Marketing umbrella term across all certs: **"Exam Lens"** (locked 2026-05-11). Internal product names like `EXAM_LENS["pmp"] = "PMI Decision Lens"` stay in the product code at [dquillman/cipher](https://github.com/dquillman/cipher) — do not use cert-specific lens names in customer-facing copy.

## Constraints (locked 2026-05-11)

- **Paid spend cap: $2/day TOTAL.** Held until 25 cumulative activated users land organically. Then unlocks as retargeting only (Reddit Promoted or Google Search RT).
- **Trial → paid target: 10%** (working assumption; recalibrate against real data).
- **LP routes:** `/lp/pmp-practice` · `/lp/security-plus-practice` · `/lp/shrm-cp-practice`.
- **TAM estimates** in the scoring matrix are working figures — no pre-launch verification required.
- **Day 2 email** uses the Exam Lens framing (deliberate departure from MARKETING-PLAN.md §9.2 wording).

See `00-campaign-brief.md` for the full strategy.

## Provenance

Originally developed inside the [Cronspire](https://github.com/dquillman/cronspire) repo at `.claude/worktrees/xenodochial-knuth-514b34/marketing/cipher-exam-launch/`. Migrated to this standalone location 2026-05-11. The Cronspire copy was preserved (not deleted) as a backup until this repo is confirmed working in production.
