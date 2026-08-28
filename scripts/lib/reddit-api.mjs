// Reddit read-only API client for the trend scout.
//
// WHY THIS EXISTS: the scout's spec defines a Reddit outlier as "net upvotes >= 2x
// the subreddit's typical post score, or comments >= 50". Neither RSS nor
// embed.reddit.com exposes a score, so every scan before 2026-08-04 fell back to
// rank-and-comment-count and could not actually apply that rule — it was a topic
// scanner wearing an outlier scanner's spec. The official API returns `score` and
// `upvote_ratio`, which is what makes the threshold computable.
//
// It also works headless, unlike a browser session, so a scheduled scout run can
// use it. That is the main reason this is the API and not Chrome automation.
//
// Auth: application-only OAuth (client_credentials). Create a "script" app at
// https://www.reddit.com/prefs/apps, then set:
//   REDDIT_CLIENT_ID
//   REDDIT_CLIENT_SECRET
//   REDDIT_USER_AGENT   e.g. "windows:cipher-trend-scout:v1.0 (by /u/yourname)"
//
// Reddit requires a descriptive User-Agent and rate-limits generic ones hard.

const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const API_BASE = "https://oauth.reddit.com";

export class RedditCredentialError extends Error {}

function readCredentials() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const userAgent = process.env.REDDIT_USER_AGENT;

  const missing = [
    !clientId && "REDDIT_CLIENT_ID",
    !clientSecret && "REDDIT_CLIENT_SECRET",
    !userAgent && "REDDIT_USER_AGENT",
  ].filter(Boolean);

  if (missing.length) {
    throw new RedditCredentialError(
      `Missing ${missing.join(", ")}.\n\n` +
        `DO NOT go and create a script app — that route is closed to us, and this\n` +
        `message used to send people round it. Verified 2026-08-28:\n\n` +
        `  1. reddit.com/prefs/apps still shows the create-app form, but it says\n` +
        `     "you must also register to use the API". That link leads to\n` +
        `     r/reddit.com/wiki/api, which says new Data API apps are for people\n` +
        `     with "a valid moderation use case". Market research is not one.\n` +
        `     Dave went round that loop twice.\n` +
        `  2. Unauthenticated JSON is gone too: r/<sub>/top.json returns HTML,\n` +
        `     on both www and old.reddit.com, even with a descriptive UA.\n\n` +
        `So there is no route to Reddit SCORES for this use case. The scanner\n` +
        `falls back to RSS top-of-week ORDER, which is real content but carries no\n` +
        `score or comment count, so the 2x-median outlier rule can never run.\n` +
        `Call it a topic scanner. Never present its output as measured engagement.\n\n` +
        `If Reddit reopens general Data API access, set:\n` +
        `  setx REDDIT_CLIENT_ID "<the string under the app name>"\n` +
        `  setx REDDIT_CLIENT_SECRET "<the secret>"\n` +
        `  setx REDDIT_USER_AGENT "windows:cipher-trend-scout:v1.0 (by /u/<yourname>)"`
    );
  }
  return { clientId, clientSecret, userAgent };
}

let cachedToken = null;

async function getToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken;
  }
  const { clientId, clientSecret, userAgent } = readCredentials();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Reddit auth failed (HTTP ${res.status}). ${body.slice(0, 200)}\n` +
        (res.status === 401
          ? "401 usually means the client id/secret are wrong, or the app is not a 'script' type app."
          : "")
    );
  }

  const json = await res.json();
  cachedToken = {
    accessToken: json.access_token,
    userAgent,
    expiresAt: Date.now() + (json.expires_in || 3600) * 1000,
  };
  return cachedToken;
}

async function apiGet(path) {
  const { accessToken, userAgent } = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": userAgent },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Reddit GET ${path} failed (HTTP ${res.status}). ${body.slice(0, 200)}`);
  }
  return res.json();
}

/** Top posts in a subreddit for a time window. `t` is hour|day|week|month|year|all. */
export async function fetchTop(subreddit, { t = "week", limit = 100 } = {}) {
  const json = await apiGet(`/r/${encodeURIComponent(subreddit)}/top?t=${t}&limit=${limit}`);
  return (json.data?.children || []).map((c) => c.data).map((d) => ({
    id: d.id,
    subreddit: d.subreddit,
    title: d.title,
    author: d.author,
    score: d.score,
    upvoteRatio: d.upvote_ratio,
    numComments: d.num_comments,
    createdUtc: d.created_utc,
    createdIso: new Date(d.created_utc * 1000).toISOString(),
    permalink: `https://www.reddit.com${d.permalink}`,
    flair: d.link_flair_text || null,
    selftext: (d.selftext || "").slice(0, 2000),
    isSelf: !!d.is_self,
    stickied: !!d.stickied,
  }));
}

function median(nums) {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Apply the scout's documented outlier rule to a week of posts:
 *   score >= OUTLIER_MULTIPLE x median score, OR numComments >= COMMENT_THRESHOLD.
 *
 * Returns { baseline, posts, outliers } so callers can report the baseline
 * honestly rather than implying an absolute threshold.
 */
export const OUTLIER_MULTIPLE = 2;
export const COMMENT_THRESHOLD = 50;

export function findOutliers(posts, { multiple = OUTLIER_MULTIPLE, commentThreshold = COMMENT_THRESHOLD } = {}) {
  // Stickied posts are moderator pins, not organic signal — they skew the baseline.
  const organic = posts.filter((p) => !p.stickied);
  const baseline = median(organic.map((p) => p.score));
  const scoreCut = baseline * multiple;

  const outliers = organic
    .map((p) => ({
      ...p,
      baseline,
      scoreRatio: baseline > 0 ? +(p.score / baseline).toFixed(2) : null,
      reasons: [
        p.score >= scoreCut && baseline > 0 ? `score ${p.score} >= ${multiple}x median ${baseline}` : null,
        p.numComments >= commentThreshold ? `${p.numComments} comments >= ${commentThreshold}` : null,
      ].filter(Boolean),
    }))
    .filter((p) => p.reasons.length > 0)
    .sort((a, b) => b.score - a.score);

  return { baseline, scoreCut, sampleSize: organic.length, outliers };
}

/** True when credentials are present, so callers can degrade honestly. */
export function hasCredentials() {
  try {
    readCredentials();
    return true;
  } catch {
    return false;
  }
}
