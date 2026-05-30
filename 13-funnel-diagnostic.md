# 13 — Daily Funnel Diagnostic (board todo #6)

> **Shipped 2026-05-28.** A one-screen, hand-updated daily view of the 5-arrow CipherExam acquisition funnel. Addresses board feedback that "0/25 on day 11 with no instrumentation telling you where the funnel is leaking" was the actual blocker.

## What it shows

Five arrows from impression to activation, the conversion rate between each, the bottleneck arrow highlighted, and per-cluster mini-funnels for PMP / Security+ / SHRM-CP.

```
Impressions → LP visits → Signups → Exam picked → Activated (≥10 Q)
            X%          X%        X%             X%
                     (bottleneck highlighted in red)
```

Plus three insight cards:
- **The bottleneck** — which arrow has the worst rate vs. its target
- **End-to-end CVR** — impressions → activated, the compounding number
- **Days to gate (linear)** — projection of when 0/25 closes at current daily rate

## Where it lives

- **Page:** `G:\Users\daveq\cipher-marketing\site\funnel.html`
- **Local URL:** `http://localhost:8766/funnel.html` (once the dashboard server is running)
- **Deploy URL:** `https://cipher-marketing-daveq.web.app/funnel.html` after the next deploy
- **Data source:** `G:\Users\daveq\cipher-marketing\site\data\campaign-state.json` → `metrics.funnel`

## Data schema (added to campaign-state.json)

```json
"metrics": {
  "...existing fields...",
  "funnel": {
    "asOf": "2026-05-28T17:30:00.000Z",
    "windowDays": 7,
    "instructions": "Hand-entered daily. ...",
    "aggregate": {
      "impressions": 0,
      "lpVisits": 0,
      "signups": 0,
      "examPicked": 0,
      "activated": 0
    },
    "perCluster": {
      "PMP":       { ...5 fields }, 
      "Security+": { ...5 fields },
      "SHRM-CP":   { ...5 fields }
    }
  }
}
```

## The 5 numbers — where each comes from

| Stage | Source | Daily update step |
|---|---|---|
| impressions | GA4 page views (`/lp/*`) + Meta Pixel reach + `posts.json` organic impressions for posted entries | GA4 → Reports → Pages → filter to `/lp/*` paths, take 7d sum. Add Meta Ads reach. Add organic post impressions from `posts.json`. |
| lpVisits | GA4 sessions on `/lp/*` | GA4 → Reports → Pages → `/lp/*` → Sessions (7d) |
| signups | Firestore `users` count, `createdAt` within window | `firebase firestore:indexes` or Cloud Console query: `users where createdAt >= [windowStart]` |
| examPicked | Same query + `selectedExamId != null` | Add filter |
| activated | Same query + `examStats.{examId}.totalAnswered >= 10` | Manual count for now; backend aggregator is a future enhancement (see roadmap §08-backlog Tier 4) |

## Daily update ritual (2 minutes)

1. Open `site/data/campaign-state.json`.
2. Update `metrics.funnel.asOf` to current ISO timestamp.
3. Update the 5 numbers in `aggregate` (totals) and each `perCluster.{exam}` block.
4. Bump `_meta.lastUpdatedAt`.
5. Hard-refresh `funnel.html` to verify rates and bottleneck call-out look right.

That's it. The page recomputes ratios + bottleneck + linear-days projection on every load.

## Rate thresholds (tunable per grading lessons)

Hard-coded in `funnel.html`:

| Arrow | "Good" threshold | "Warn" threshold |
|---|---|---|
| Impressions → LP | 50% | 10% |
| LP → Signup | 8% (LP CVR) | 3% |
| Signup → Exam picked | 80% | 50% |
| Exam picked → Activated (10Q) | 50% | 25% |

These are baseline industry guesses for cold-traffic B2C cert-prep SaaS. Brad/grader will refine via `grading-lessons.md` once 2–3 weeks of real data flow through. When you want to update thresholds, search `RATE_TIERS` in `funnel.html`.

## Bottleneck logic

The page picks "the bottleneck" as the arrow with the largest gap below its "good" threshold, ignoring arrows where the upstream stage is 0 (can't be the bottleneck if nothing reached it). That's the arrow the board's been telling you to work on — fix it before anything else.

## Adding it to dashboard nav

Currently funnel.html is reachable directly. To add to the app.html top-nav (recommended), append a `<button class="nav-link" data-route="funnel">Funnel</button>` to the nav strip and a corresponding `.route-section[data-route="funnel"]` containing an `<iframe src="funnel.html">` or inline the page contents.

Not done in this pass — leaving as a 10-min wiring task because the route-router pattern in app.html is bespoke and worth a focused edit later.

## What this unblocks

The board's prioritized list had #5 as "Watch 10 Clarity recordings on /lp/pmp-practice." That move surfaces *qualitative* signal (what users do on the LP). This diagnostic surfaces *quantitative* signal (which arrow is the worst). Together they're the answer to "what should I fix next" — Clarity tells you why an arrow is leaking; this page tells you which arrow.

Recommended use:
1. Open this page every morning.
2. If "The bottleneck" hasn't changed in 3 days → that arrow needs a structural fix, not a content tweak.
3. If "End-to-end CVR" has moved >20% week-over-week → write what changed into `grading-lessons.md`.
4. Reference "Days to gate (linear)" when deciding whether to ship a planned feature vs. patch the bottleneck.

## Future enhancements (deferred)

- **Auto-pull from GA4** via the Data API (`gtag('config', 'G-...')` → backend cron → write to `funnel.aggregate`). Removes the hand-update step. Effort: 1 day.
- **Per-day sparklines** to spot whether a bottleneck is moving or static. Effort: half-day.
- **In-page editor** — small form to update the 5 numbers without opening JSON. Effort: half-day.
- **Cluster-level bottleneck** highlighting (not just aggregate). Currently per-cluster shows raw numbers + rates but doesn't tag the cluster's own worst arrow. Effort: an hour.

None of these are gating; the hand-update flow is fine at current data volume.

## Rollback

```bash
# Just delete the funnel.html and remove the funnel field from campaign-state.json
cd G:\Users\daveq\cipher-marketing
git revert <commit>
```

No dependency on funnel.html from anything else; safe to drop at any time.
