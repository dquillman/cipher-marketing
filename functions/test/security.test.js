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
