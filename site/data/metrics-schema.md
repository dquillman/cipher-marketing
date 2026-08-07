# Post Metrics — Canonical Schema

Source of truth for the `metrics` object on every post in `posts.json`. Read by `post-performance-grader` when recording metrics and by `draft-week-posts` when reasoning about prior performance.

**Why this file exists.** Before 2026-08-06 there was no schema — eight graded posts carried **seven different key sets**. X posts used `engagementActions` / `profileVisits` / `followsGained` / `replies` / `bookmarks` while LinkedIn posts used `socialEngagements` / `profileViewers` / `followersGained` / `comments` / `saves` for the same concepts, so no cross-channel comparison was possible. Three concrete failures came out of that:

1. The grader's engagement formula read `likes`, which LinkedIn does not report — it reports **Reactions**. Both fields existed and were both `0`, which hid the bug.
2. The grader's A/B criteria required `linkClickRatePct`, but LinkedIn's post-analytics export has no clicks field, so **no LinkedIn post could ever score above C**.
3. LinkedIn's in-network / out-of-network split had no field at all — and when it was finally captured on 2026-08-05 it produced the most valuable finding of the campaign (out-of-network 3% → 41%). The May posts have no such data to compare against.

---

## The rule

**Every metrics object carries every core key.** A metric the platform doesn't provide is `null`, never omitted and never `0`. `0` means measured-as-zero; `null` means not-measured. Conflating them is how the `likes` bug survived.

Anything a platform reports that isn't a core key goes in `channelExtras`, not at the top level.

---

## Core keys

| Key | Type | Meaning |
|---|---|---|
| `impressions` | int | Times the post was served |
| `membersReached` | int·null | Unique people reached. LinkedIn only; X does not report it |
| `impressionsToReachPct` | float·null | `membersReached / impressions × 100`. **Leading indicator of algorithmic framing penalties** — below ~15% means repeat-serving the same feeds instead of expanding |
| `inNetworkPct` | float·null | % served to followers/connections. LinkedIn only |
| `outOfNetworkPct` | float·null | % served beyond the network. LinkedIn only. **The expansion signal** — this is what moved 3% → 41% between 2026-08-03 and 2026-08-05 |
| `reactions` | int·null | LinkedIn "Reactions" / X "Likes" |
| `comments` | int·null | LinkedIn "Comments" / X "Replies" |
| `reposts` | int·null | Both platforms |
| `saves` | int·null | LinkedIn "Saves" / X "Bookmarks" |
| `sends` | int·null | LinkedIn "Sends". X has no equivalent |
| `socialEngagements` | int·null | Platform's own total. LinkedIn "Social engagements" / X "Engagements" |
| `engagementRatePct` | float·null | `socialEngagements / impressions × 100` |
| `videoViews` | int·null | |
| `videoViewRatePct` | float·null | `videoViews / impressions × 100`. **Can exceed 100% on X**, which counts views differently from impressions — not a bug, don't clamp it |
| `watchTimeSeconds` | int·null | Total |
| `avgWatchTimeSeconds` | int·null | |
| `profileViewers` | int·null | LinkedIn "Profile viewers from this post" / X "Profile visits" |
| `followersGained` | int·null | LinkedIn "Followers gained from this post" / X "Follows" |
| `linkClicks` | int·null | **X reports this natively; LinkedIn does not.** See below |
| `linkClickRatePct` | float·null | `linkClicks / impressions × 100` |
| `trialSignupsAttributed` | int·null | From GA4 / Firestore. The only number that ultimately matters |
| `gradedAt` | ISO string | |
| `notes` | string·null | Caveats, provenance, missing-data flags. Replaces ad-hoc one-off keys |
| `channelExtras` | object·null | Platform-specific fields with no cross-channel meaning |

---

## Where `linkClicks` comes from — and it differs by channel

**X reports it natively.** Its analytics panel has an explicit "Link clicks" figure (verified against a real export, 2026-08-06).

**LinkedIn does not.** Its post-analytics export has four sections — Discovery, Video performance, Profile activity, Engagement — and none contains a clicks field (verified against two real exports, 2026-08-06). The May 2026 LinkedIn entries carry `linkClicks: 1` with unclear provenance, probably GA4. Treat those as unverified.

So:

| Channel | Primary source | Fallback |
|---|---|---|
| X | platform export | GA4 by UTM |
| LinkedIn | **GA4 by UTM** | none — leave `null` |

GA4 is the truer number either way: the platform counts clicks, GA4 counts arrivals. Every CTA already carries `utm_source` / `utm_campaign` / `utm_content`.

✅ **`lnkd.in` shorteners are fine — verified 2026-08-06.** LinkedIn auto-shortens any URL in post text, but the redirect preserves the full query string. Both August posts resolve to properly tagged destinations with distinct `utm_content` values:

```
lnkd.in/grQNRxYH → /lp/pmp?utm_source=linkedin&utm_campaign=pmp_judgment_2026&utm_content=the-exam-changed
lnkd.in/ggUpDnTt → /lp/pmp?utm_source=linkedin&utm_campaign=pmp_judgment_2026&utm_content=experience-trap
```

So GA4 has per-post LinkedIn click data and it is fully recoverable. Paste the UTM'd URL as normal and let LinkedIn shorten it — nothing is lost. (An earlier version of this file claimed the opposite; that was an inference, and checking the redirects disproved it.)

The thing that genuinely breaks attribution is **reusing the same `utm_content` across posts** — which is exactly what happened in Week 1 and collapsed that week's data permanently. Give every post a unique `utm_content`. The August posts do.

⚠️ Week 1 UTMs were mis-tagged: `utm_content=mon_launch` went out on all three LinkedIn posts, so per-post attribution for that week is collapsed and unrecoverable. Don't try to reconstruct it.

If GA4 hasn't been checked yet, `linkClicks` is `null` — not `0`.

---

## Field mapping

### LinkedIn export → canonical

| Export label | Canonical key |
|---|---|
| Impressions | `impressions` |
| Members reached | `membersReached` |
| In-network (followers and connections) | `inNetworkPct` |
| Out-of-network | `outOfNetworkPct` |
| Reactions | `reactions` |
| Comments | `comments` |
| Reposts | `reposts` |
| Saves | `saves` |
| Sends on LinkedIn | `sends` |
| Social engagements | `socialEngagements` |
| Video views | `videoViews` |
| Watch time | `watchTimeSeconds` |
| Average watch time | `avgWatchTimeSeconds` |
| Profile viewers from this post | `profileViewers` |
| Followers gained from this post | `followersGained` |
| *(not exported)* | `linkClicks` → GA4 |

### X export → canonical

| Export label | Canonical key |
|---|---|
| Impressions | `impressions` |
| Likes | `reactions` |
| Replies | `comments` |
| Reposts | `reposts` |
| Bookmarks | `saves` |
| Engagements | `socialEngagements` |
| Video views | `videoViews` |
| Profile visits | `profileViewers` |
| Follows | `followersGained` |
| Link clicks | `linkClicks` |
| Detail expands | `channelExtras.detailExpands` |
| Audience retention | `channelExtras.audienceRetentionPct` |
| Unique video views | `channelExtras.videoUniqueViews` |
| *(no equivalent)* | `membersReached`, `sends`, `inNetworkPct`, `outOfNetworkPct` → `null` |

---

## Notes for the grader

- **Engagement rate uses `socialEngagements`**, the platform's own total. Do not re-derive it by summing components — the platform counts actions we don't itemize, and summing double-counts against `reactions`.
- **`reactions` is the LinkedIn field.** There is no `likes` key any more. X's "Likes" maps onto `reactions`.
- **A and B must be reachable without platform clicks.** LinkedIn cannot supply `linkClicks`, so a rubric requiring `linkClickRatePct` for A/B caps every LinkedIn post at C forever. When `linkClicks` is `null`, grade on `engagementRatePct` + `impressionsToReachPct` + `outOfNetworkPct` and say so in `gradeNotes`.
- **Watch the reach ratios before the absolute numbers.** A post with 45 impressions at 40% reach and 41% out-of-network is healthier than one with 238 impressions at 9% out-of-network.

---

## Known data caveats in the existing set

- `li-fri-2026-05-15-domains` records **238** impressions, but `grading-lessons.md` cites **222** for the same post in several places. The lesson text was written before a long-tail regrade. The conclusions still hold; the number in prose is stale.
- The two August posts have no post time in their export. `scheduledTime` / `postedAt` use the campaign default 10:30 MT and are approximate.
- `x-wed-2026-05-13-trap` and `x-fri-2026-05-15-domains` have 2 impressions each. No rate computed from them is meaningful.
