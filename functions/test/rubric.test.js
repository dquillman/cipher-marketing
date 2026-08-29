// Regression fixtures for the grading rubric.
//
// Every case here is a bug that actually shipped, found on 2026-08-29 by
// hand-recomputing all 15 graded LinkedIn posts and comparing against what the
// pipeline produced. Each one is named for the wrong answer it used to give,
// so a future change that reintroduces it fails loudly instead of quietly
// re-grading the corpus.
//
//   cd functions && npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { letterGrade, weightedEngagementRatePct, pct, LOW_CONFIDENCE_IMPRESSIONS } from '../rubric.js';

// The live LinkedIn benchmarks, plus the reach-ratio pair the documented
// fallback in site/data/metrics-schema.md requires.
const LI = {
  engagementRatePctGoodAtLeast: 2,
  engagementRatePctGreatAtLeast: 5,
  linkClickRatePctGoodAtLeast: 1,
  linkClickRatePctGreatAtLeast: 2.5,
  videoViewRatePctGoodAtLeast: 30,
  videoViewRatePctGreatAtLeast: 50,
  outOfNetworkPctGoodAtLeast: 40,
  outOfNetworkPctGreatAtLeast: 70,
  impressionsToReachPctGoodAtLeast: 20,
  impressionsToReachPctGreatAtLeast: 40,
};

// X reports clicks natively but never reports the network split.
const X = {
  engagementRatePctGoodAtLeast: 2,
  engagementRatePctGreatAtLeast: 5,
  linkClickRatePctGoodAtLeast: 1,
  linkClickRatePctGreatAtLeast: 2.5,
};

test('an unmeasured link-click rate is skipped, not banded as zero', () => {
  // The bug: index.js did Number(metrics.linkClicks || 0), so "GA4 was never
  // checked" became "nobody clicked", and band() returns -1 for exactly 0.
  // A LinkedIn post at 12% engagement and 95% out-of-network scored
  // 2 + (-1) + 2 = 3/6 = 0.50 = B, making A unreachable without a signup.
  const excellent = {
    engagementRatePct: 12,
    linkClickRatePct: null,
    hasVideo: false,
    benchmarks: LI,
    outOfNetworkPct: 95,
    impressionsToReachPct: 66,
  };
  assert.equal(letterGrade(excellent), 'A');
});

test('a measured zero click rate still counts against the post', () => {
  // The fix must not throw away real information: GA4 ran and returned 0 is a
  // genuine result and has to keep banding -1.
  const measuredZero = {
    engagementRatePct: 12,
    linkClickRatePct: 0,
    hasVideo: false,
    benchmarks: LI,
    outOfNetworkPct: 95,
    impressionsToReachPct: 66,
  };
  assert.equal(letterGrade(measuredZero), 'B');
});

test('reach ratio stands in for clicks only when clicks are unmeasured', () => {
  // Documented in metrics-schema.md: "When linkClicks is null, grade on
  // engagementRatePct + impressionsToReachPct + outOfNetworkPct."
  const base = { engagementRatePct: 3, hasVideo: false, benchmarks: LI, outOfNetworkPct: 45 };
  // engagement 3% -> band 1, out-of-network 45% -> band 1, so the middle band
  // is the only thing moving in these three cases.
  //
  // Clicks unmeasured, reach ratio poor -> the ratio occupies the band and
  // scores 0: 1 + 0 + 1 = 2/6 = 0.333 -> C.
  assert.equal(letterGrade({ ...base, linkClickRatePct: null, impressionsToReachPct: 5 }), 'C');
  // Same post, great reach ratio -> band 2: 1 + 2 + 1 = 4/6 = 0.667 -> B.
  assert.equal(letterGrade({ ...base, linkClickRatePct: null, impressionsToReachPct: 66 }), 'B');
  // Clicks measured -> the ratio must NOT also be banded. A poor ratio
  // alongside a great click rate still gives 1 + 2 + 1 = 4/6 -> B; if the
  // ratio were double-counted this would fall to C.
  assert.equal(letterGrade({ ...base, linkClickRatePct: 3, impressionsToReachPct: 5 }), 'B');
});

test('a video post whose export omitted views is not banded on it', () => {
  // hasVideo came from the hand-maintained post.video flag while the rate came
  // from metrics.videoViews. Flag true + views null meant null -> 0 -> band -1
  // AND max += 2: a two-band swing against a metric nobody measured.
  const withNullViews = {
    engagementRatePct: 6,
    linkClickRatePct: null,
    videoViewRatePct: null,
    hasVideo: true,
    benchmarks: LI,
    outOfNetworkPct: 80,
    impressionsToReachPct: 50,
  };
  assert.equal(letterGrade(withNullViews), 'A');
});

test('X is never penalised for the network split it cannot report', () => {
  const xPost = {
    engagementRatePct: 6,
    linkClickRatePct: 3,
    hasVideo: false,
    benchmarks: X,
    outOfNetworkPct: null,
    impressionsToReachPct: null,
  };
  assert.equal(letterGrade(xPost), 'A');
});

test('weighted engagement falls back only when there is no breakdown at all', () => {
  // The old guard was `!sawComponent || weighted === 0`. sawComponent is
  // already true for a measured 0, so the second clause only ever fired for a
  // post whose breakdown was measured and genuinely all zeros — and then
  // handed back the platform's flat rate. A post with 12 socialEngagements on
  // 300 impressions and every weighted component measured 0 was graded at
  // 4.00% instead of its true 0%.
  const allZerosMeasured = { reactions: 0, comments: 0, reposts: 0, saves: 0, sends: 0 };
  assert.equal(weightedEngagementRatePct(allZerosMeasured, 300, pct(12, 300)), 0);

  // No breakdown at all -> keep the platform's own rate rather than inventing
  // a downgrade out of missing data.
  assert.equal(
    weightedEngagementRatePct({}, 300, pct(12, 300)),
    pct(12, 300)
  );
});

test('comments are weighted above reactions', () => {
  const comments = weightedEngagementRatePct({ comments: 3 }, 300, pct(3, 300));
  const reactions = weightedEngagementRatePct({ reactions: 3 }, 300, pct(3, 300));
  assert.ok(comments > reactions, 'a written reply must outweigh a tap');
  assert.equal(comments, pct(9, 300));
});

test('re-measuring a post never improves its grade without new engagement', () => {
  // The bug this replaces: a full-letter penalty below 200 impressions, applied
  // to a number that only grows, while every rate it graded had impressions in
  // the denominator. li-wed-2026-08-19-sme-04 graded D at 113 impressions and C
  // at 241 — same 2 comments, engagement rate halved, grade improved.
  const gradeAt = (impressions) => {
    const m = { reactions: 0, comments: 2, reposts: 0, saves: 0, sends: 0 };
    const er = weightedEngagementRatePct(m, impressions, pct(2, impressions));
    return letterGrade({
      engagementRatePct: er,
      linkClickRatePct: 0,
      hasVideo: false,
      benchmarks: LI,
      outOfNetworkPct: 58,
      impressionsToReachPct: 44,
      lowConfidence: impressions < LOW_CONFIDENCE_IMPRESSIONS.linkedin,
      expectsNetworkSplit: true,
    });
  };
  assert.equal(gradeAt(113), gradeAt(241), 'the 48h read and the 7d read must land on the same letter');
  // And the boundary itself must not be a cliff.
  assert.equal(gradeAt(199), gradeAt(200), 'crossing the impression floor must not hand out a letter');
});

test('a thin impression base cannot band "great"', () => {
  // 2 comments on 90 impressions is a weighted 6.67%, which used to out-band
  // the 2,731-impression post that drew 19 comments (2.31%).
  const tiny = weightedEngagementRatePct({ comments: 2 }, 90, pct(2, 90));
  assert.ok(tiny > LI.engagementRatePctGreatAtLeast, 'precondition: the raw rate does clear "great"');
  const capped = letterGrade({
    engagementRatePct: tiny, linkClickRatePct: null, hasVideo: false, benchmarks: LI,
    outOfNetworkPct: 95, impressionsToReachPct: 66, lowConfidence: true, expectsNetworkSplit: true,
  });
  const uncapped = letterGrade({
    engagementRatePct: tiny, linkClickRatePct: null, hasVideo: false, benchmarks: LI,
    outOfNetworkPct: 95, impressionsToReachPct: 66, lowConfidence: false, expectsNetworkSplit: true,
  });
  const order = { A: 3, B: 2, C: 1, D: 0 };
  assert.ok(order[capped] < order[uncapped], 'a noisy rate on a thin base must not score like a real one');
});

test('omitting the network split is never better than reporting a bad one', () => {
  // Because the grade is score/max, a band scoring 0 still adds 2 to the
  // denominator — so a grader who failed to scroll LinkedIn's lazy Discovery
  // block used to get a BETTER grade than one who read the true 6%.
  const shared = {
    engagementRatePct: 3, linkClickRatePct: 1.5, hasVideo: false,
    benchmarks: LI, impressionsToReachPct: 30, expectsNetworkSplit: true,
  };
  const honest = letterGrade({ ...shared, outOfNetworkPct: 6 });
  const omitted = letterGrade({ ...shared, outOfNetworkPct: null });
  const order = { A: 3, B: 2, C: 1, D: 0 };
  assert.ok(order[omitted] <= order[honest], 'leaving the field blank must not pay');
});

test('X is not charged for the network split it cannot report', () => {
  // The rule above must apply only to channels that actually have the metric.
  const withFlag = letterGrade({
    engagementRatePct: 6, linkClickRatePct: 3, hasVideo: false, benchmarks: X,
    outOfNetworkPct: null, impressionsToReachPct: null, expectsNetworkSplit: false,
  });
  assert.equal(withFlag, 'A');
});

test('a post nobody engaged with cannot outscore one they did', () => {
  const silent = {
    engagementRatePct: 0,
    linkClickRatePct: null,
    hasVideo: false,
    benchmarks: LI,
    outOfNetworkPct: 45,
    impressionsToReachPct: 45,
  };
  const engaged = { ...silent, engagementRatePct: 6 };
  const order = { A: 3, B: 2, C: 1, D: 0 };
  assert.ok(order[letterGrade(engaged)] > order[letterGrade(silent)]);
});
