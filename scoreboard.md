# Scoreboard — one row every Monday, 09:00 MT

The single revenue truth for the 2026-08 plan. Fill one row per Monday inside the 20-minute ritual (plan §4.4), then draft that morning's scoreboard post straight from the row.

**Sources, in order — do not substitute.**

| # | Number | Where it comes from |
|---|---|---|
| 1 | Active paid subscriptions | Stripe Dashboard **live mode** → Billing → Subscriptions, filter Active |
| 2 | Paying / activated / trials started / trials expiring | `cd G:\Users\daveq\Cipher\functions` → `node scripts\list_users.js` |
| 3 | Cancellations (voluntary vs payment-failure) | Stripe Dashboard → Subscriptions filter Canceled + Revenue recovery report |
| 4 | `billing_events_unresolved` count — **must be 0** | Admin-Core → Billing page. Nonzero = someone paid and got nothing. Fix same day. |
| 5 | Lead captures, and captures by `utm_source` | Firebase console → Firestore → `leadCaptures` |
| 6 | Sessions by source · lp_view→capture · `trial_start` by source | GA4 → Reports → Traffic acquisition |
| 7 | 7-day impressions, follower count | LinkedIn analytics |

🚫 **Never read revenue from the Admin-Core RevenueDashboard** — `src\pages\RevenueDashboard.tsx:11` hardcodes `PRICE_PER_USER = 9.99`, which matches no product. Every MRR number it has ever shown is wrong. Stripe live mode is the only revenue truth until that line is fixed.

Dave's own refunded runbook verification buys never count in any row.

---

## Rows

| Monday | Paying /10 | Active subs | Activated /25 | Lead captures | Trials started 7d | Cancels 7d | Unresolved billing | LI impressions 7d | LI followers | Sessions by source | Notes / gate fired |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-08-10 | | | | | | | | | | | Baseline row. Log the single-channel P0 scope ruling (3 exemptions) here. Rotate factory/phoenix-engine keys. Flip Stripe dunning toggles. |
| 2026-08-17 | | | | | | | | | | | Week-1 gate was Fri 08-14: captures ≥3? |
| 2026-08-24 | | | | | | | | | | | MT gate ruled Fri 08-21. deadline-shield charge settlement must be proven today, before Show HN 08-25. |
| 2026-08-31 | | | | | | | | | | | First-charged-dollar gate was Fri 08-28: 1 × $59? |
| 2026-09-07 | | | | | | | | | | | 30-day channel review — four thresholds. Probation gate ruled Fri 09-04. |
| 2026-09-14 | | | | | | | | | | | deadline-shield first subscriber gate was Fri 09-11. |
| 2026-09-21 | | | | | | | | | | | |
| 2026-09-28 | | | | | | | | | | | **Two gates: 12-authority-post kill verdict + CipherExam 0-subscription rule.** |
| 2026-10-02 (Fri) | | | | | | | | | | | **Week-8 board read.** Target $115 MRR / ≈$480 charged. Pricing fallbacks due. Weeks 9–12 branch. |

---

## Baseline at load (2026-08-08, verified on disk)

Everything starts from zero, and saying so plainly is what makes the later rows mean something.

- Recorded revenue, entire portfolio: **$0**
- Activated users: **0** · Trial signups: **0** · Lead captures ever: **0**
- Published testimonials: **0** (live Firestore pull)
- LinkedIn: ~**638** lifetime impressions, **3** link clicks, **2** reactions, **0** comments ever, <500 followers
- Post grades to date: 8 graded — **6 D, 2 C**, zero A or B
- CipherExam Stripe live since **2026-08-04**; email infrastructure live since **2026-08-06**
