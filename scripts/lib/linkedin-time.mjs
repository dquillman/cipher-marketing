// When a LinkedIn post was actually published — read off the permalink itself.
//
// Why this exists (2026-09-01): every write path used to stamp postedAt with
// `new Date()` at the moment Dave got round to recording the post, not the
// moment LinkedIn published it. Measured drift across the last six hand-recorded
// posts ran +1.5 to +26.8 minutes, always late. That is not cosmetic: it made
// check-reveal-due.mjs report a live, on-time reveal as still owed, because the
// reveal's true instant preceded the post's own inflated postedAt, and
// mark-reveal-posted.mjs then refused to record it. The guard was right; the
// number it compared against was wrong.
//
// A LinkedIn activity id carries its creation time in the top bits (snowflake
// layout: milliseconds since the Unix epoch, shifted left 22). So a permalink is
// self-dating, and there is no reason to guess.

const ACTIVITY_URN = /urn:li:activity:(\d+)/;

// Anything outside this window means we decoded something that is not an
// activity id — better to fall back than to write a postedAt in 1975 or 2140.
const FLOOR_MS = Date.parse("2010-01-01T00:00:00Z");
const CEIL_SLACK_MS = 24 * 60 * 60 * 1000;

/**
 * Publish instant encoded in a LinkedIn permalink, as an ISO string.
 * Returns null when the url carries no activity urn or decodes implausibly —
 * callers should fall back to their own clock and say so.
 */
export function postedAtFromUrn(url) {
  const m = ACTIVITY_URN.exec(url || "");
  if (!m) return null;
  try {
    const ms = Number(BigInt(m[1]) >> 22n);
    if (!Number.isFinite(ms)) return null;
    if (ms < FLOOR_MS) return null;
    if (ms > Date.now() + CEIL_SLACK_MS) return null;
    return new Date(ms).toISOString();
  } catch {
    return null;
  }
}

/**
 * postedAt for a post being marked published: the permalink's own instant when
 * we can read it, otherwise now. `source` tells the caller which happened so it
 * can report honestly rather than implying a precision it does not have.
 */
export function resolvePostedAt(url, now = new Date()) {
  const fromUrn = postedAtFromUrn(url);
  if (fromUrn) return { postedAt: fromUrn, source: "urn" };
  return { postedAt: now.toISOString(), source: "clock" };
}
