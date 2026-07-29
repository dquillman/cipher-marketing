export const MAX_GRADE_BODY_BYTES = 16 * 1024;
const BOOTSTRAP_OPERATOR_EMAILS = new Set([
  'davequillman@gmail.com',
  'dquillman2112@gmail.com',
]);

const NUMERIC_LIMITS = {
  impressions: 10_000_000,
  membersReached: 10_000_000,
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
  if (entries.length > Object.keys(NUMERIC_LIMITS).length + 1) {
    throw new RequestError(400, 'Too many metric fields.');
  }

  const clean = {};
  for (const [key, value] of entries) {
    if (key === 'autoRemoved') {
      if (typeof value !== 'boolean') throw new RequestError(400, 'autoRemoved must be boolean.');
      clean[key] = value;
      continue;
    }
    if (!(key in NUMERIC_LIMITS)) throw new RequestError(400, `Unsupported metric: ${key}`);
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || number > NUMERIC_LIMITS[key]) {
      throw new RequestError(400, `Invalid value for metric: ${key}`);
    }
    clean[key] = number;
  }

  return { postId, metrics: clean };
}
