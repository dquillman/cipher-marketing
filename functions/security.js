export const MAX_GRADE_BODY_BYTES = 16 * 1024;
const BOOTSTRAP_OPERATOR_EMAILS = new Set([
  'davequillman@gmail.com',
  'dquillman2112@gmail.com',
]);

const MAX_NOTES_LENGTH = 2000;

const NUMERIC_LIMITS = {
  impressions: 10_000_000,
  membersReached: 10_000_000,
  inNetworkPct: 100,
  outOfNetworkPct: 100,
  upvotes: 10_000_000,
  upvoteRatio: 1,
  videoViews: 10_000_000,
  watchTimeSeconds: 100_000_000,
  avgWatchTimeSeconds: 86_400,
  socialEngagements: 10_000_000,
  reactions: 10_000_000,
  likes: 10_000_000,
  comments: 10_000_000,
  replies: 10_000_000,
  reposts: 10_000_000,
  saves: 10_000_000,
  sends: 10_000_000,
  bookmarks: 10_000_000,
  linkClicks: 10_000_000,
  totalSpendUsd: 100_000,
  profileViewers: 10_000_000,
  followersGained: 10_000_000,
  profileVisits: 10_000_000,
  followsGained: 10_000_000,
  engagementActions: 10_000_000,
  trialSignupsAttributed: 10_000_000,
  // Derived rates. The endpoint recomputes all four and its own values win, so
  // these are accepted only so that a previously-graded post can be submitted
  // back unmodified. Rejecting them made re-grading impossible.
  //
  // Not capped at 100: engagement and link-click rates exceed it on tiny
  // denominators (an X post hit 77.8% on 9 impressions), and videoViewRatePct
  // legitimately exceeds 100% because X counts views differently from
  // impressions — metrics-schema.md says explicitly not to clamp it.
  impressionsToReachPct: 100,
  engagementRatePct: 100_000,
  linkClickRatePct: 100_000,
  videoViewRatePct: 100_000,
};

export class RequestError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'RequestError';
    this.statusCode = statusCode;
  }
}

export function requireMarketingAdmin(decodedToken) {
  if (!decodedToken || decodedToken.marketingAdmin !== true) {
    throw new RequestError(403, 'Marketing administrator access required.');
  }
  return decodedToken;
}

export function requireBootstrapOperator(decodedToken) {
  const email = String(decodedToken?.email || '').toLowerCase();
  if (decodedToken?.email_verified !== true || !BOOTSTRAP_OPERATOR_EMAILS.has(email)) {
    throw new RequestError(403, 'This Google account is not authorized for Cipher Marketing.');
  }
  return decodedToken;
}

export function validateGradePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new RequestError(400, 'JSON request body required.');
  }
  if (JSON.stringify(body).length > MAX_GRADE_BODY_BYTES) {
    throw new RequestError(413, 'Request body is too large.');
  }

  const { postId, metrics } = body;
  if (typeof postId !== 'string' || postId.length < 1 || postId.length > 160) {
    throw new RequestError(400, 'postId must be 1-160 characters.');
  }
  if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) {
    throw new RequestError(400, 'metrics must be an object.');
  }

  const entries = Object.entries(metrics);
  // +3: autoRemoved, channelExtras and notes live outside NUMERIC_LIMITS.
  if (entries.length > Object.keys(NUMERIC_LIMITS).length + 3) {
    throw new RequestError(400, 'Too many metric fields.');
  }

  const clean = {};
  for (const [key, value] of entries) {
    if (key === 'autoRemoved') {
      if (typeof value !== 'boolean') throw new RequestError(400, 'autoRemoved must be boolean.');
      clean[key] = value;
      continue;
    }
    if (key === 'channelExtras') {
      clean[key] = validateChannelExtras(value);
      continue;
    }
    // `notes` is a core key the endpoint itself writes (caveats, provenance,
    // missing-data flags). Refusing it on the way back in made re-grading a
    // post impossible: the only way to pass validation was to drop the field,
    // which silently destroyed the note. Found 2026-08-08 backfilling GA4
    // clicks onto already-graded posts.
    if (key === 'notes') {
      if (value === null) { clean[key] = null; continue; }
      if (typeof value !== 'string') throw new RequestError(400, 'notes must be a string or null.');
      if (value.length > MAX_NOTES_LENGTH) {
        throw new RequestError(400, `notes must be at most ${MAX_NOTES_LENGTH} characters.`);
      }
      clean[key] = value;
      continue;
    }
    if (!(key in NUMERIC_LIMITS)) throw new RequestError(400, `Unsupported metric: ${key}`);
    // null means not-measured (site/data/metrics-schema.md) — persist it as
    // null; Number(null) is 0, which would fabricate a measurement.
    if (value === null) {
      clean[key] = null;
      continue;
    }
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || number > NUMERIC_LIMITS[key]) {
      throw new RequestError(400, `Invalid value for metric: ${key}`);
    }
    clean[key] = number;
  }

  return { postId, metrics: clean };
}

function validateChannelExtras(value) {
  if (value === null) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new RequestError(400, 'channelExtras must be an object or null.');
  }
  const entries = Object.entries(value);
  if (entries.length > 12) throw new RequestError(400, 'Too many channelExtras fields.');
  const clean = {};
  for (const [key, raw] of entries) {
    if (key.length < 1 || key.length > 48) {
      throw new RequestError(400, 'channelExtras keys must be 1-48 characters.');
    }
    if (raw === null) {
      clean[key] = null;
      continue;
    }
    const number = Number(raw);
    if (!Number.isFinite(number) || number < 0 || number > 100_000_000) {
      throw new RequestError(400, `Invalid value for channelExtras.${key}`);
    }
    clean[key] = number;
  }
  return clean;
}
