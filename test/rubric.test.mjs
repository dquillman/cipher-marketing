import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ENGAGEMENT_WEIGHTS,
  letterGrade,
  weightedEngagementRatePct,
} from '../functions/rubric.js';

// The rubric had no tests at all until the weighting change on 2026-08-10.
// It decides every letter grade in the product, so drift here is worse than a
// bug — it silently changes what "good" means.

const LI = {
  engagementRatePctGoodAtLeast: 2,
  engagementRatePctGreatAtLeast: 5,
  linkClickRatePctGoodAtLeast: 1,
  linkClickRatePctGreatAtLeast: 2.5,
  videoViewRatePctGoodAtLeast: 30,
  videoViewRatePctGreatAtLeast: 50,
  outOfNetworkPctGoodAtLeast: 40,
  outOfNetworkPctGreatAtLeast: 70,
};

test('a comment is worth more than a reaction', () => {
  const impressions = 732;
  const flat = (7 / impressions) * 100;

  const sixComments = weightedEngagementRatePct(
    { reactions: 1, comments: 6, reposts: 0, saves: 0, sends: 0 }, impressions, flat);
  const sevenReactions = weightedEngagementRatePct(
    { reactions: 7, comments: 0, reposts: 0, saves: 0, sends: 0 }, impressions, flat);

  assert.ok(sixComments > sevenReactions,
    `6 comments (${sixComments.toFixed(2)}%) must beat 7 reactions (${sevenReactions.toFixed(2)}%)`);
  // 1*1 + 6*3 = 19 weighted actions
  assert.ok(Math.abs(sixComments - (19 / impressions) * 100) < 0.01);
});

test('a rollup with no weightable breakdown keeps the flat rate', () => {
  // The 2026-08-03 X post reported 7 engagements that were all detail expands —
  // a field with no weight. Returning 0 would invent a downgrade from missing
  // data rather than measuring anything.
  const flat = (7 / 9) * 100;
  assert.equal(
    weightedEngagementRatePct({ reactions: 0, comments: 0, reposts: 0, saves: 0, sends: 0 }, 9, flat),
    flat,
  );
  assert.equal(weightedEngagementRatePct({}, 9, flat), flat);
  assert.equal(
    weightedEngagementRatePct({ reactions: null, comments: null }, 9, flat),
    flat,
  );
});

test('X likes still count — the legacy field name is honoured', () => {
  const rate = weightedEngagementRatePct({ likes: 4 }, 100, 0);
  assert.equal(rate, 4); // 4 * weight 1 / 100 * 100
  assert.equal(ENGAGEMENT_WEIGHTS.reactions, 1);
});

test('the sponsor-scenario post grades B, not C', () => {
  // 732 impressions, 1 reaction + 6 comments, 6 link clicks, 90% out-of-network.
  // Under the flat rubric this scored 0/4 and graded C — the same as if it had
  // collected 7 likes and never left Dave's own network.
  const impressions = 732;
  const flat = (7 / impressions) * 100;

  const graded = letterGrade({
    engagementRatePct: weightedEngagementRatePct(
      { reactions: 1, comments: 6, reposts: 0, saves: 0, sends: 0 }, impressions, flat),
    linkClickRatePct: (6 / impressions) * 100,
    videoViewRatePct: 0,
    hasVideo: false,
    benchmarks: LI,
    outOfNetworkPct: 90,
  });
  assert.equal(graded, 'B');

  const underOldRubric = letterGrade({
    engagementRatePct: flat,
    linkClickRatePct: (6 / impressions) * 100,
    videoViewRatePct: 0,
    hasVideo: false,
    benchmarks: LI,
    outOfNetworkPct: null,
  });
  assert.equal(underOldRubric, 'C');
});

test('out-of-network is only banded when the platform reports it', () => {
  const base = {
    engagementRatePct: 3, linkClickRatePct: 1.5, videoViewRatePct: 0,
    hasVideo: false, benchmarks: LI,
  };
  // X never reports reach composition. Passing null must not cost it anything:
  // same inputs, null vs a mid-range value, must not grade the null case lower.
  const withoutMetric = letterGrade({ ...base, outOfNetworkPct: null });
  const withGoodMetric = letterGrade({ ...base, outOfNetworkPct: 50 });
  assert.equal(withoutMetric, 'B');
  assert.equal(withGoodMetric, 'B');

  // A post trapped inside its own network scores worse than one that escaped.
  const trapped = letterGrade({ ...base, outOfNetworkPct: 0 });
  const escaped = letterGrade({ ...base, outOfNetworkPct: 90 });
  assert.ok('DCBA'.indexOf(trapped) < 'DCBA'.indexOf(escaped),
    `trapped (${trapped}) must grade below escaped (${escaped})`);
});

test('a dead post still grades D', () => {
  assert.equal(letterGrade({
    engagementRatePct: 0, linkClickRatePct: 0, videoViewRatePct: 0,
    hasVideo: false, benchmarks: LI, outOfNetworkPct: null,
  }), 'D');
});

test('the weighting cannot rescue a post nobody engaged with', () => {
  // 0 engagements weighted is still 0 — the change must not inflate silence.
  const rate = weightedEngagementRatePct(
    { reactions: 0, comments: 0, reposts: 0, saves: 0, sends: 0 }, 500, 0);
  assert.equal(rate, 0);
});
