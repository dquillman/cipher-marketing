import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RequestError,
  requireBootstrapOperator,
  requireMarketingAdmin,
  validateGradePayload,
} from '../security.js';

test('requires the explicit marketing admin claim', () => {
  assert.equal(requireMarketingAdmin({ uid: 'admin', marketingAdmin: true }).uid, 'admin');
  assert.throws(
    () => requireMarketingAdmin({ uid: 'user' }),
    (error) => error instanceof RequestError && error.statusCode === 403
  );
});

test('bootstraps only the two verified operator emails', () => {
  assert.equal(
    requireBootstrapOperator({
      uid: 'operator',
      email: 'DAVEQUILLMAN@GMAIL.COM',
      email_verified: true,
    }).uid,
    'operator',
  );
  for (const token of [
    { uid: 'unverified', email: 'davequillman@gmail.com', email_verified: false },
    { uid: 'outsider', email: 'outsider@example.com', email_verified: true },
  ]) {
    assert.throws(
      () => requireBootstrapOperator(token),
      (error) => error instanceof RequestError && error.statusCode === 403,
    );
  }
});

test('accepts and normalizes supported grade metrics', () => {
  const result = validateGradePayload({
    postId: 'post-1',
    metrics: { impressions: '125', linkClicks: 4, autoRemoved: false },
  });
  assert.deepEqual(result, {
    postId: 'post-1',
    metrics: { impressions: 125, linkClicks: 4, autoRemoved: false },
  });
});

test('accepts the canonical LinkedIn network-split and null-means-not-measured', () => {
  // Mirrors what the dashboard grade modal actually sends (see app.html
  // submitGrade and site/data/metrics-schema.md).
  const result = validateGradePayload({
    postId: 'li-thu-2026-08-07-sponsor-scenario',
    metrics: {
      impressions: 310,
      membersReached: 200,
      inNetworkPct: 13,
      outOfNetworkPct: 87,
      linkClicks: null,
      sends: null,
    },
  });
  assert.deepEqual(result.metrics, {
    impressions: 310,
    membersReached: 200,
    inNetworkPct: 13,
    outOfNetworkPct: 87,
    linkClicks: null,
    sends: null,
  });
});

test('accepts channelExtras as a bounded numeric object', () => {
  const result = validateGradePayload({
    postId: 'post-1',
    metrics: { impressions: 100, channelExtras: { detailExpands: '7' } },
  });
  assert.deepEqual(result.metrics.channelExtras, { detailExpands: 7 });
  assert.equal(
    validateGradePayload({ postId: 'post-1', metrics: { channelExtras: null } }).metrics.channelExtras,
    null,
  );
  for (const channelExtras of [
    [1, 2],
    { detailExpands: 'not-a-number' },
    { detailExpands: -1 },
    { ['x'.repeat(49)]: 1 },
  ]) {
    assert.throws(
      () => validateGradePayload({ postId: 'post-1', metrics: { channelExtras } }),
      (error) => error instanceof RequestError && error.statusCode === 400,
    );
  }
});

test('accepts notes so an already-graded post can be re-graded', () => {
  // The endpoint writes `notes` itself. Rejecting it on the way back in meant
  // the only way to re-grade a post was to drop the field, destroying the
  // provenance record it holds.
  const note = 'Rates are meaningless at 9 impressions — recorded for completeness.';
  const result = validateGradePayload({
    postId: 'post-1',
    metrics: { impressions: 9, notes: note },
  });
  assert.equal(result.metrics.notes, note);
  assert.equal(
    validateGradePayload({ postId: 'post-1', metrics: { notes: null } }).metrics.notes,
    null,
  );
  for (const notes of [42, { text: 'x' }, 'x'.repeat(2001)]) {
    assert.throws(
      () => validateGradePayload({ postId: 'post-1', metrics: { notes } }),
      (error) => error instanceof RequestError && error.statusCode === 400,
    );
  }
});

test('a full canonical metrics object round-trips through the validator', () => {
  // Whatever the endpoint writes, it must accept back — otherwise re-grading
  // is impossible for exactly the posts that carry the most metadata.
  const written = {
    impressions: 169, membersReached: null, impressionsToReachPct: null,
    inNetworkPct: null, outOfNetworkPct: null,
    reactions: 0, comments: 0, reposts: 0, saves: 0, sends: 0,
    socialEngagements: 0, engagementRatePct: 0,
    videoViews: 27, videoViewRatePct: 15.98, watchTimeSeconds: 591, avgWatchTimeSeconds: 21,
    profileViewers: 0, followersGained: 0,
    linkClicks: 1, linkClickRatePct: 0.59, trialSignupsAttributed: 0,
    notes: 'provenance', channelExtras: { detailExpands: 7 },
  };
  assert.doesNotThrow(() => validateGradePayload({ postId: 'post-1', metrics: written }));
});

test('rejects out-of-range network percentages', () => {
  for (const metrics of [{ inNetworkPct: 101 }, { outOfNetworkPct: 100.5 }]) {
    assert.throws(
      () => validateGradePayload({ postId: 'post-1', metrics }),
      (error) => error instanceof RequestError && error.statusCode === 400,
    );
  }
});

test('rejects unknown, negative, non-finite, and oversized metrics', () => {
  for (const metrics of [
    { madeUp: 1 },
    { impressions: -1 },
    { impressions: 'not-a-number' },
    { impressions: 10_000_001 },
  ]) {
    assert.throws(
      () => validateGradePayload({ postId: 'post-1', metrics }),
      (error) => error instanceof RequestError && error.statusCode === 400
    );
  }
});

test('rejects malformed identifiers and bodies', () => {
  assert.throws(() => validateGradePayload(null), RequestError);
  assert.throws(() => validateGradePayload({ postId: '', metrics: {} }), RequestError);
  assert.throws(
    () => validateGradePayload({ postId: 'x'.repeat(161), metrics: {} }),
    RequestError
  );
});
