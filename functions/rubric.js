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
  if (!sawComponent || weighted === 0) return engagementRatePct;
  return pct(weighted, impressions);
}

function band(value, good, great) {
  if (value >= great) return 2;
  if (value >= good) return 1;
  return value > 0 ? 0 : -1;
}

// Rate-based grade (LinkedIn / X / Reddit Ads — all have impressions)
export function letterGrade({
  engagementRatePct,
  linkClickRatePct,
  videoViewRatePct,
  hasVideo,
  benchmarks,
  outOfNetworkPct,
}) {
  let score = band(engagementRatePct, benchmarks.engagementRatePctGoodAtLeast, benchmarks.engagementRatePctGreatAtLeast)
            + band(linkClickRatePct, benchmarks.linkClickRatePctGoodAtLeast, benchmarks.linkClickRatePctGreatAtLeast);
  let max = 4;

  if (hasVideo && benchmarks.videoViewRatePctGoodAtLeast != null) {
    score += band(videoViewRatePct, benchmarks.videoViewRatePctGoodAtLeast, benchmarks.videoViewRatePctGreatAtLeast);
    max += 2;
  }

  // Reach beyond the author's own network is the clearest evidence the
  // algorithm chose to distribute a post, and it was recorded but never
  // scored. Only banded when the platform actually reports it — LinkedIn does,
  // X does not, so an X post is never penalised for a metric it cannot supply.
  if (outOfNetworkPct != null && benchmarks.outOfNetworkPctGoodAtLeast != null) {
    score += band(outOfNetworkPct, benchmarks.outOfNetworkPctGoodAtLeast, benchmarks.outOfNetworkPctGreatAtLeast);
    max += 2;
  }

  const pctOfMax = score / max;
  if (pctOfMax >= 0.80) return 'A';
  if (pctOfMax >= 0.40) return 'B';
  if (pctOfMax >= 0.00) return 'C';
  return 'D';
}
