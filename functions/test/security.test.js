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
