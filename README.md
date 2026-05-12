# CipherExam — Marketing Campaign

Standalone repo for the **CipherExam** (cipherexam.com) multi-exam acquisition campaign. Companion to the product code at [github.com/dquillman/cipher](https://github.com/dquillman/cipher).

## What's in here

- **Campaign source-of-truth** (`*.md`) — brief, cornerstone blog, social posts, onboarding email sequence, landing-page reference copy, brand voice review, engineering handoff
- **Interactive dashboard site** (`site/`) — multi-section SPA with daily todos, KPI cards, scratchpad, JSON state layer
- **Remotion videos** (`videos/`) — 20 rendered MP4s + 12 still-frame PNG ad creatives, in 1:1 / 9:16 / 4:5 LinkedIn-optimised aspects
- **Live campaign state** (`site/data/campaign-state.json`) — single source of truth for activated-user count, blockers, daily log, decisions

## Quick start

```bash
# 1. Install Remotion deps (one-time)
cd videos
npm install

# 2. Build the site
cd ../site
node inline-assets.mjs    # bake CSS/JS/state into source pages
node build-app.mjs        # produce app.html + launch-campaign.html

# 3. Run a local server to view it
python -m http.server 8766
# Open http://localhost:8766/app.html
```

## Daily workflow

Open `site/app.html` in a browser. The **Today** tab shows today's tasks (based on `site/assets/site.js` CAMPAIGN_START), recommended video creative, and a scratchpad with a "Copy update for Claude" button that produces a structured update message.

When you paste an update into Claude Code, Claude updates `site/data/campaign-state.json`, re-runs `inline-assets.mjs` + `build-app.mjs`, and the page reflects new state on refresh.

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
