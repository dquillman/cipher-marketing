# 18 — Merge Plan: cipher-marketing → qcode

> **Status:** Plan, written 2026-06-12. Phase 0 (in-repo dedup) executed same day; Phases 1+ awaiting Dave's go.
> **Ask:** "Develop a plan to merge cipher-marketing with qcode — remove all duplicate items."
> **Recommendation in one line:** Dedup now (done), physically merge **after the Week 4 retro (2026-06-15)** as `qcode/marketing/`, keep both Firebase projects through the merge, and gate any *unified dashboard* work on the board's traction condition.

> **UPDATE 2026-06-12 (same day):** Dave's actual goal was data sharing, which shipped WITHOUT the merge — qcode v2.26.0 (`9eaea652`) reads CipherExam KPIs and competitors from Firestore (`firestore://cipher-marketing-daveq/campaign/state` and `campaign/competitors`) instead of local file paths into this repo. That removes the path coupling that made Phase 2 risky and makes the physical merge pure housekeeping — optional, any time, or never. §3d's "project metadata" row and the registry kpiSource/competitorSource concerns are resolved. `scripts/push-competitors-doc.mjs` mirrors competitors.json → Firestore; the monthly intel task knows to re-run it.

---

## 1. What the two repos actually are (verified 2026-06-12)

| | cipher-marketing | qcode |
|---|---|---|
| Purpose | CipherExam campaign workspace: hand-edited dashboard, grading function, posts/state data, Remotion creatives, strategy docs 00–17 | Personal portfolio (Next.js 15) **plus the cross-project ops console** (`/ops` + `api/ops/*` + `scripts/ops-agent.mjs`) |
| Firebase project | `cipher-marketing-daveq` (hosting + `gradePost` function + Firestore `campaign/*`, `competitor_intel/*`) | `qcode-9a2dc` (hosting via Next adapter + Firestore projects collection) |
| Stack | Static HTML/JS (site/), Node function, 2× Remotion projects | Next.js 15 + React 19 + TS + Tailwind 4 + firebase-admin |
| Deployed | cipher-marketing-daveq.web.app (v1.5.0) | qcode-9a2dc (v2.3.0) |

**The key structural fact:** qcode is already the hub. Its ops registry (`src/lib/ops-projects.json`) lists all 10 of Dave's projects including `cipher-marketing` itself, and reads CipherExam KPIs directly from `cipher-marketing/site/data/campaign-state.json`. The "ops relay" that commits to cipher-marketing (`b2ac741`) IS qcode's ops agent. So this merge formalizes a relationship that already exists — qcode absorbs cipher-marketing, not the other way around.

---

## 2. Constraints the plan must respect

1. **Board ruling (2026-05-30, unanimous):** do NOT build a unified cross-product dashboard until at least one non-zero cohort exists. Activation is currently **0/25**. A repo merge is mechanical consolidation and is fine; a merged *dashboard* is the comfort-build the board flagged. Phase 4 below is therefore gated.
2. **Multi-product roadmap (doc 10) Phase 1 gate:** don't generalize the Brad pattern until CipherExam Weeks 1–4 prove it (gate: 25 activated users + 1 graded post). Week 4 ends **2026-06-15**.
3. **Campaign is live through 2026-06-15.** Brad, the grader, the drafting skill, and the `cipher-competitor-intel-refresh` scheduled task all hard-code `G:\Users\daveq\cipher-marketing\...` paths. Moving the repo mid-campaign breaks the pipeline during its proof week. **Do not move files before 06-15.**
4. **`site/app.html` is hand-edited** (wipe guards added in `a630e99`). The merge must move it verbatim — never regenerate it.

---

## 3. Duplicate inventory and disposition

### 3a. Inside cipher-marketing — REMOVED in Phase 0 (2026-06-12) ✅

| Duplicate | Evidence | Action |
|---|---|---|
| Root `launch-campaign.html` (May 16) vs `site/launch-campaign.html` (May 28, current) | serve.mjs serves only `site/`; firebase hosting serves only `site/`; build scripts write only to `site/` | ✅ Deleted root copy |
| 4 stale `.claude/worktrees/*` (≈5.5 MB, each holding copies of site/ + videos/) | All on branches at `aaa8713`, fully merged into main, zero unmerged commits | ✅ Worktrees removed, `claude/*` branches deleted |

### 3b. Inside cipher-marketing — handled in Phase 2 (post-retro)

| Duplicate | Evidence | Disposition |
|---|---|---|
| **Two Remotion pipelines:** `videos/` (organic creatives: launch-teaser/ai-tutor-demo/domain-weights → `videos/out/`, referenced by the dashboard) and `remotion/` (paid-ad comps: CipherExamAd, MotionAd, Hybrid) | Two separate package.json + node_modules + duplicated BrandLogo/EndCard/Caption components | Consolidate into ONE Remotion project (`videos/`) with two composition families (`organic/`, `ads/`). `videos/out/` path must not change (dashboard's `VIDEO_DIR` points at it). |
| Operator pages (`site/today.html`, `schedule.html`, …) vs `site/app.html` sections | By-design duplication; wipe guards now make it safe | KEEP — this is the canonical-source pattern, not waste. Documented in memory + guards. |
| `site/data/competitors.json` vs Firestore `competitor_intel/*` | Dashboard reads Firestore; qcode's registry `competitorSource` still points at the JSON file | Pick one: update qcode's registry to read Firestore (preferred) and delete the JSON, or keep the JSON as the agreed export format. Decide in Phase 2. |
| `plugins/` (one `plugin.json.draft`) | Draft never shipped | Move to `archive/` during the merge. |

### 3c. Inside qcode — handled in Phase 2

| Duplicate / dead item | Evidence | Disposition |
|---|---|---|
| Deprecated Cloud Run + Postgres files (`scripts/migrate.js`, `migrate.sql`, `cloudbuild.yaml`-era files, Postgres placeholders in `env.prod.yaml`) | README: "slated for removal; ignore them" | Delete in Phase 2. |
| Next.js default scaffolding in `public/` (`next.svg`, `vercel.svg`, `globe.svg`, `file.svg`, `window.svg`), `src/app/favicon.ico.bak` | Unused boilerplate | Delete. |
| `src/data/projects.json` (empty `[]`) vs Firestore projects collection | Legacy localStorage-era duplicate of the Firestore store | Delete the file if `src/data/projects.ts` no longer imports it; otherwise reduce to the single canonical source. |
| `tsconfig.tsbuildinfo`, `.env` committed at root | Build artifact + secret-bearing file in a repo | gitignore both; rotate anything sensitive in `.env`. |

### 3d. Cross-repo duplicates — resolved by the merge itself (Phases 2–3)

| Duplicate | Today | After merge |
|---|---|---|
| **Project metadata** (names, repo paths, URLs, KPI sources) | qcode `ops-projects.json` + qcode portfolio cards + cipher-marketing docs each describe the same projects | `ops-projects.json` becomes the single registry; portfolio cards and marketing dashboards read from it (or from the Firestore copy it feeds). |
| **Two "what should I do now" surfaces** | qcode `/ops` board/todos vs cipher dashboard Today tab | Near-term: keep both (different altitude — portfolio ops vs campaign ops). Long-term unification = Phase 4, **gated by the board's traction condition**. |
| Two `.claude/` configs (launch.json, settings.local.json) | One per repo | Merge into qcode's `.claude/`; add a "Marketing Dashboard" launch config pointing at `marketing/serve.mjs`. |
| Two ops script sets (`qcode/scripts/ops-*.mjs` writes INTO cipher-marketing; `cipher-marketing/scripts/*`) | Cross-repo coupling via absolute paths | All under one repo; ops-agent paths become repo-relative. |
| Two firebase.json / firestore.rules / .firebaserc | One per project | Keep BOTH Firebase projects; cipher config moves to `marketing/firebase.json` + `marketing/.firebaserc`. (Collapsing into one Firebase project is explicitly out of scope — see §6.) |
| Two README / AGENTS conventions | Separate | One root README with a `marketing/` section; AGENTS.md gains the app.html cardinal rules. |

---

## 4. Target layout (end of Phase 2)

```
qcode/
├── src/ …                      # portfolio + ops console (unchanged)
├── public/ …                   # cleaned of Next.js boilerplate
├── docs/ …
├── scripts/                    # ops-agent.mjs etc., paths now repo-relative
├── marketing/                  # ← cipher-marketing, history preserved
│   ├── site/                   # hand-edited dashboard (deploys to cipher-marketing-daveq)
│   ├── functions/              # gradePost
│   ├── videos/                 # SINGLE Remotion project (organic + ads families)
│   ├── docs/                   # 00–17 strategy docs + this plan
│   ├── lead-magnets/  positioning/  archive/  scripts/
│   ├── firebase.json  .firebaserc  serve.mjs  package.json
└── package.json                # qcode app (marketing/ stays self-contained — no workspace rewiring)
```

---

## 5. Phases

### Phase 0 — In-repo dedup ✅ DONE 2026-06-12
Stale root rollup deleted; 4 merged worktrees + branches pruned. Committed in this repo.

### Phase 1 — Pre-merge freeze & inventory (do on 2026-06-15/16, ~30 min)
1. Week 4 retro lands; campaign enters its post-campaign cycle (calendar already handles this).
2. Build the **path-reference checklist** — every file that hard-codes `cipher-marketing`:
   `grep -ril "cipher-marketing" C:\Users\daveq\.claude\` (agents: brad, cipher-exam-marketing, post-performance-grader, cipher-trend-scout, cipher-competitor-analyst; skills: draft-week-posts, weekly-performance-report, cipher-exam-context, project-status; scheduled task: cipher-competitor-intel-refresh; board files; memory MEMORY.md + topic files) plus `qcode/src/lib/ops-projects.json` and `qcode/scripts/ops-agent.mjs`.
3. Confirm both repos are clean and pushed/backed up.

### Phase 2 — Physical merge with history (1–2 h)
1. In qcode: `git subtree add --prefix=marketing <path-or-url-to-cipher-marketing> main` — preserves full history under `marketing/` (alternative: `git merge --allow-unrelated-histories` after `git filter-repo --to-subdirectory-filter marketing`; subtree is simpler and good enough).
2. Inside `marketing/`: apply §3b dispositions (consolidate Remotion pipelines, move `plugins/` draft to archive, decide competitors.json source).
3. Apply §3c qcode cleanups (deprecated Postgres/Cloud Run files, boilerplate svgs, empty projects.json, gitignore .env + tsbuildinfo).
4. Update every path on the Phase 1 checklist: `G:\Users\daveq\cipher-marketing\…` → `G:\Users\daveq\qcode\marketing\…`. This is the highest-risk step — miss one and Brad/grader/scheduled task silently breaks. Verify with the same grep returning zero stale hits.
5. Deploy check: from `qcode/marketing/` run `firebase deploy --only hosting` (project cipher-marketing-daveq) and confirm the dashboard still serves; run `qcode-preflight` + deploy for the portfolio. Nothing about either deploy changes except the working directory.
6. Smoke-test the pipeline end-to-end: Brad "walk me through today", one `/api/grade` submission, ops console refresh against the new `repoPath`.
7. Retire the old repo: rename `G:\Users\daveq\cipher-marketing` → `cipher-marketing.pre-merge-backup` for two weeks, then delete. Do NOT leave it in place — qcode's ops agent or a stale skill finding the old path is how split-brain starts.
8. Update memory (MEMORY.md primer + build-chain/feedback files) with the new paths the same day.

### Phase 3 — Convergence cleanups (opportunistic, after Phase 2 settles)
- Single registry: portfolio cards + marketing dashboard both fed from `ops-projects.json` (or its Firestore mirror).
- Decide qcode portfolio CTA strategy (passive showcase vs funnel — see qc-context §strategic questions); CipherExam card links to /lp/pmp.
- One `.claude/launch.json` with all three dev servers.

### Phase 4 — Unified dashboard ⛔ GATED
Merging qcode `/ops` and the marketing Today tab into one multi-product command center is the doc-10 Phase 2+ vision. **Board condition: ≥1 non-zero cohort (and doc-10's own gate: 25 activated users + 1 graded post).** Until then the two surfaces stay separate; revisit at the first month with real traction.

---

## 6. Explicitly out of scope (and why)

- **Collapsing the two Firebase projects into one.** Firestore data migration (`campaign/*`, `competitor_intel/*`), the `gradePost` rewrite target, the ANTHROPIC_API_KEY secret, and the hosting rewrite for `/api/grade` would all move for zero user-visible benefit. Two projects under one repo is fine indefinitely.
- **Rewriting the marketing dashboard in Next.js.** app.html works, is guarded, and the board says no dashboard investment until traction.
- **Generalizing Brad to multi-product.** Doc 10 Phase 2 — separate effort, gated on the same Week-4 signal.

## 7. Decisions Dave owns

1. **Go/no-go on Phase 2 after 2026-06-15** (recommended: go).
2. Competitor data source of record: Firestore `competitor_intel` (recommended) or `site/data/competitors.json`.
3. Keep or kill the paid-ads Remotion comps when consolidating (`remotion/` family) — none have run since the paid gate is locked at 0/25.
4. Delete the pre-merge backup after the two-week soak.

## 8. Rollback

Phase 2 is one commit in qcode (`git revert` the subtree-add) plus restoring the renamed backup directory and the path checklist. Nothing in Firestore or Firebase Hosting changes during the merge itself, so production is untouched by a rollback.
