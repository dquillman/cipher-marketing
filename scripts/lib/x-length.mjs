// Weighted character counting for X (Twitter) posts.
//
// X does NOT count raw characters. It uses the twitter-text v3 weighting config:
//   - every URL counts as exactly 23 characters, no matter how long it is
//     (so trimming UTM params saves you nothing on X)
//   - most Latin/punctuation code points weigh 1
//   - everything else — emoji, arrows (→), most symbols — weighs 2
//
// The composer greys out the Post button and shows a negative counter once the
// weighted length exceeds 280. See checkXCopy() for the guard used by the
// seeding scripts.

export const X_MAX_WEIGHTED_LENGTH = 280;
export const X_URL_WEIGHTED_LENGTH = 23;

// twitter-text v3 ranges whose code points weigh 1 instead of 2.
const LIGHT_RANGES = [
  [0, 4351],
  [8192, 8205],
  [8208, 8223],
  [8242, 8247],
];

const URL_RE = /https?:\/\/\S+/gi;

const segmenter =
  typeof Intl !== "undefined" && Intl.Segmenter
    ? new Intl.Segmenter("en", { granularity: "grapheme" })
    : null;

function isLight(codePoint) {
  return LIGHT_RANGES.some(([lo, hi]) => codePoint >= lo && codePoint <= hi);
}

function graphemes(text) {
  if (segmenter) return [...segmenter.segment(text)].map((s) => s.segment);
  return [...text];
}

/** Weighted length of `text` as X counts it. */
export function xWeightedLength(text) {
  const urls = text.match(URL_RE) || [];
  const body = text.replace(URL_RE, "");

  let weight = 0;
  for (const g of graphemes(body)) {
    // A grapheme cluster weighs 1 only if every code point in it is "light".
    const light = [...g].every((c) => isLight(c.codePointAt(0)));
    weight += light ? 1 : 2;
  }

  return weight + urls.length * X_URL_WEIGHTED_LENGTH;
}

/**
 * Returns { id, length, over, ok } for one post copy.
 * `over` is how many weighted characters must be cut (0 when it fits).
 */
export function checkXCopy(copy, id = "(unnamed)") {
  const length = xWeightedLength(copy);
  const over = Math.max(0, length - X_MAX_WEIGHTED_LENGTH);
  return { id, length, over, ok: over === 0 };
}

/**
 * Throws if any entry is over the limit. Use as a preflight in any script that
 * writes X copy to Firestore, so an unpostable draft never reaches the dashboard.
 * `entries` is an array of { id, copy }.
 */
export function assertXCopyFits(entries) {
  const bad = entries
    .map(({ id, copy }) => checkXCopy(copy, id))
    .filter((r) => !r.ok);

  if (bad.length === 0) return;

  const detail = bad
    .map((r) => `  • ${r.id}: ${r.length}/280 (${r.over} over)`)
    .join("\n");
  throw new Error(
    `${bad.length} X post(s) exceed the 280-character limit and cannot be posted:\n${detail}\n\n` +
      `Remember: shortening the URL does not help — X counts every link as 23 characters.`
  );
}
