// Post grading rubric.
//
// Extracted from index.js so it can be unit-tested: index.js calls
// initializeApp() at module load, so importing it from a test is not viable,
// and grading logic is the one thing in this service that must not drift
// silently. Same split as security.js.

export function pct(n, d) { return d > 0 ? (n / d) * 100 : 0; }

// Not every engagement is worth the same. A comment costs the reader real
// effort, signals genuine interest, and is what actually pushes a post beyond
// the author's own network; a reaction is a tap. Grading on the flat
// socialEngagements rollup treated them identically — so the 2026-08-07
// sponsor-scenario post, which drew 6 comments on a feed that had never
// received one and travelled 90% out-of-network, scored the same 0.96% as if
// it had collected 7 likes, and graded C.
//
// Weights are ordered by what each action costs the reader and what it does
// for distribution. Deliberately modest — a 3x comment weight, not 10x — so
// this reweights the ranking without making the existing benchmarks trivial.
export const ENGAGEMENT_WEIGHTS = {
  comments: 3,   // written reply; the strongest signal available
  reposts: 3,    // explicit amplification to their own network
  sends: 2,      // private share — high intent, invisible to the feed
  saves: 2,      // intent to return
  reactions: 1,  // baseline
};

/**
 * Weighted engagement rate, used ONLY for grading.
 *
 * engagementRatePct stays the platform's own flat rate — it is what the
 * analytics page shows, tests assert it equals socialEngagements/impressions,
 * and changing it would make the dashboard disagree with LinkedIn.
 */
export function weightedEngagementRatePct(metrics, impressions, engagementRatePct) {
  let weighted = 0;
  let sawComponent = false;

  for (const [key, weight] of Object.entries(ENGAGEMENT_WEIGHTS)) {
    const raw = metrics[key] ?? (key === 'reactions' ? metrics.likes : null);
    if (raw != null) {
      sawComponent = true;
      weighted += Number(raw) * weight;
    }
  }

  // A post can report a rollup without a usable breakdown — the 2026-08-03 X
  // post logged 7 engagements that were all detail expands, a field with no
  // weight here. Falling through to 0 would invent a downgrade out of missing
  // data, so keep the flat rate when there is nothing to weight.
  //
  // The `weighted === 0` half of that guard used to be OR'd in here, and it
  // conflated two opposite situations. sawComponent is already true when a
  // component is a measured 0, so the extra clause only ever fired for a post
  // whose breakdown was measured and genuinely all zeros — and it then handed
  // back the platform's flat rate, which on LinkedIn counts actions carrying
  // no weight here. A post with 12 socialEngagements on 300 impressions and
  // every weighted component measured 0 was graded at 4.00% instead of its
  // true 0%: a two-band swing, enough on its own to move C to B, invented out
  // of a post nobody reacted to. Only the genuine no-breakdown case falls back
  // now (found 2026-08-29).
  if (!sawComponent) return engagementRatePct;
  return pct(weighted, impressions);
}

// 2 = great, 1 = good, 0 = below the bar but non-zero, -1 = a measured zero.
//
// The -1 tier is deliberate and was CHECKED, not inherited: it encodes that a
// true zero is qualitatively worse than a small positive number. Flattening it
// to a plain 0/1/2 scale was tried on 2026-08-29 and rejected — it moved 5 of
// 15 grades and promoted li-mon-2026-08-17-scoreboard-01 (6% out-of-network
// and a 4.8% reach ratio, the worst-distributed post in the corpus) from D to
// C. The one post the flat scale was supposed to rescue,
// li-mon-2026-05-11-launch, turns out to have earned its C honestly: zero
// social engagement but 4 real link clicks on 173 impressions, which is the
// outcome that actually matters. The rule stays.
//
// `cap` supports the small-sample rule: on a thin impression base a rate is
// mostly noise, so it may reach "good" but not "great".
function band(value, good, great, cap = 2) {
  if (value >= great) return Math.min(2, cap);
  if (value >= good) return Math.min(1, cap);
  return value > 0 ? 0 : -1;
}

// Below this many impressions a rate is computed on too small a denominator to
// be trusted at face value: 2 comments on 90 impressions is 6.67%, which used
// to out-band the 2,731-impression post that drew 19 comments.
//
// This REPLACES the old full-letter "tiny reach" penalty, which was a step
// function applied to a number that only ever grows while every rate it graded
// had impressions underneath it. The two moved in opposite directions, so a
// post could improve a letter by being re-measured with no new engagement at
// all: li-wed-2026-08-19-sme-04 graded D at 113 impressions and C at 241 with
// its engagement rate halved. Capping the band instead of dropping the letter
// makes the grade monotonic — as impressions grow the cap lifts and the rates
// fall, and the post lands in the same place either way.
export const LOW_CONFIDENCE_IMPRESSIONS = { linkedin: 200, x: 500 };

// Rate-based grade (LinkedIn / X / Reddit Ads — all have impressions)
//
// NULL MEANS NOT MEASURED, AND AN UNMEASURED METRIC IS NEVER SCORED.
//
// This used to be true of outOfNetworkPct alone. Every other rate arrived here
// already coerced to 0 by `Number(metrics.x || 0)` in index.js, and band()
// returns -1 for exactly 0 — so a metric the platform never reports cost the
// post a full band AND inflated max by 2. On LinkedIn, which cannot supply
// linkClicks at all, that made an A mathematically unreachable: a post at 12%
// engagement and 95% out-of-network scored 2 + (-1) + 2 = 3/6 = 0.50 = B.
// The only LinkedIn A on file (li-thu-2026-08-07-sponsor-scenario) is an A
// solely because of the trial-signup bump; its raw grade is B.
//
// site/data/metrics-schema.md has said the intended behaviour all along:
//   "A and B must be reachable without platform clicks. LinkedIn cannot supply
//    linkClicks, so a rubric requiring linkClickRatePct for A/B caps every
//    LinkedIn post at C forever. When linkClicks is null, grade on
//    engagementRatePct + impressionsToReachPct + outOfNetworkPct."
// That contract was written and never implemented. It is implemented here.
// Found 2026-08-29 by hand-recomputing all 15 graded posts.
export function letterGrade({
  engagementRatePct,
  linkClickRatePct,
  videoViewRatePct,
  hasVideo,
  benchmarks,
  outOfNetworkPct,
  impressionsToReachPct,
  lowConfidence = false,
  expectsNetworkSplit = false,
}) {
  let score = 0;
  let max = 0;
  // On a thin impression base every rate is noise, so nothing may band "great".
  const cap = lowConfidence ? 1 : 2;

  // Engagement is the one rate every channel can always supply.
  score += band(engagementRatePct, benchmarks.engagementRatePctGoodAtLeast, benchmarks.engagementRatePctGreatAtLeast, cap);
  max += 2;

  // Clicks: scored only when actually measured. On LinkedIn that means GA4 ran
  // and returned a number; a null here is "nobody checked", not "nobody clicked".
  const clicksMeasured = linkClickRatePct != null;
  if (clicksMeasured) {
    score += band(linkClickRatePct, benchmarks.linkClickRatePctGoodAtLeast, benchmarks.linkClickRatePctGreatAtLeast, cap);
    max += 2;
  } else if (impressionsToReachPct != null && benchmarks.impressionsToReachPctGoodAtLeast != null) {
    // The documented substitute. Reach ratio is the leading indicator of an
    // algorithmic framing penalty and is always available on LinkedIn, so it
    // stands in for the band clicks would have occupied rather than leaving
    // the post graded on engagement alone.
    score += band(impressionsToReachPct, benchmarks.impressionsToReachPctGoodAtLeast, benchmarks.impressionsToReachPctGreatAtLeast, cap);
    max += 2;
  }

  // Video: only when the post actually carries one AND views were reported.
  // hasVideo alone used to be enough, so a video post whose export omitted
  // videoViews was banded against a metric nobody measured.
  if (hasVideo && videoViewRatePct != null && benchmarks.videoViewRatePctGoodAtLeast != null) {
    score += band(videoViewRatePct, benchmarks.videoViewRatePctGoodAtLeast, benchmarks.videoViewRatePctGreatAtLeast, cap);
    max += 2;
  }

  // Reach beyond the author's own network is the clearest evidence the
  // algorithm chose to distribute a post.
  //
  // OMITTING IT MUST NEVER BEAT REPORTING AN HONEST LOW NUMBER. Because the
  // grade is score/max, a band that scores 0 also adds 2 to the denominator,
  // so a post reporting a true 6% out-of-network scored WORSE than the same
  // post with the field left blank — a grader who failed to scroll LinkedIn's
  // lazy-rendering Discovery block got the better grade. LinkedIn always
  // reports this split, so on LinkedIn a missing value is a collection
  // failure, not an absent metric: it still costs the band. X genuinely cannot
  // supply it and is never charged for it (found 2026-08-29).
  if (outOfNetworkPct != null && benchmarks.outOfNetworkPctGoodAtLeast != null) {
    score += band(outOfNetworkPct, benchmarks.outOfNetworkPctGoodAtLeast, benchmarks.outOfNetworkPctGreatAtLeast, cap);
    max += 2;
  } else if (expectsNetworkSplit && benchmarks.outOfNetworkPctGoodAtLeast != null) {
    max += 2; // score += 0 — never better than an honest low reading
  }

  const pctOfMax = score / max;
  if (pctOfMax >= 0.80) return 'A';
  if (pctOfMax >= 0.40) return 'B';
  if (pctOfMax >= 0.00) return 'C';
  return 'D';
}
