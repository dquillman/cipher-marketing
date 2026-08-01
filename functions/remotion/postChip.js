// Picks the top-right chip for a post video.
//
// The exam-fee cost anchor used to appear on EVERY video. That blunts it:
// a jolt only works when it's occasional, and on a news or poll post the
// price is irrelevant noise competing with the hook. Worse, pairing every
// impression with "$425" anchors the brand to the candidate's expense
// rather than to what CipherExam does. (Dave, 2026-07-31.)
//
// TWO EARLIER ATTEMPTS FAILED — learn from both before editing:
//  1. Substring matching on the copy fired the fee chip on "feeling"
//     (contains "fee") and on "they fail a test". Cert-prep copy is full of
//     fail/feel/become/record, so bare substrings always misfire.
//  2. Whole-word matching on the copy was still wrong: a campaign week
//     about the July 2026 ECO change mentions "change"/"update" in nearly
//     every post, so the news chip landed on 7 of 12 posts including polls.
//
// So classification reads the HOOK SLUG — the editorial label already
// assigned per post — and only consults the copy for a literal dollar
// amount. Insight posts (the majority) rotate through several true brand
// facts keyed off the post id, so consecutive posts don't repeat one chip.
//
// Mirrored by videos/src/data/postChip.ts — keep the two in sync.

// Engagement formats: the hook IS the post, a chip only competes with it.
const QUIET_HOOKS = ["poll", "vote", "challenge", "checklist", "quiz"];
// Genuine money/risk angles.
const FEE_HOOKS = ["cost", "fee", "price", "retake", "worth", "expensive", "afford"];
// Genuine exam-change / news angles.
const UPDATE_HOOKS = ["changed", "change", "eco", "updated", "update", "revision", "2026"];

// Rotating facts for everything else. All verifiable: PMP full mock is
// 180 questions / 230 minutes, 11 certifications are live, and every
// question is Bloom's-classified (the core IP). Keep additions TRUE.
const LENS_CHIPS = [
  { label: "Exam Lens", value: "WHY, NOT JUST WHAT" },
  { label: "PMP full mock", value: "180 Q · 230 MIN" },
  { label: "CipherExam", value: "11 CERTIFICATIONS" },
  { label: "Every question", value: "BLOOM'S-CLASSIFIED" },
];

const DOLLAR_AMOUNT = /\$\s?\d/;

function hasWord(text, words) {
  return words.some((w) => new RegExp("\\b" + w + "\\b", "i").test(text));
}

// Stable per-post index so the same post always gets the same fact, but
// different posts spread across the set.
function stableIndex(id, len) {
  let h = 0;
  for (let i = 0; i < String(id).length; i++) h = (h * 31 + String(id).charCodeAt(i)) >>> 0;
  return h % len;
}

export function pickChip(post, examName, examPrice) {
  const hook = String(post.hook || "").replace(/-/g, " ");
  const copy = String(post.copy || "");
  const exam = examName || "";

  if (hasWord(hook, QUIET_HOOKS)) return null;

  if (examPrice != null && (hasWord(hook, FEE_HOOKS) || DOLLAR_AMOUNT.test(copy))) {
    return { label: `${exam} exam fee`, value: `$${examPrice}` };
  }

  if (hasWord(hook, UPDATE_HOOKS)) {
    return { label: `${exam} exam`, value: "UPDATED 2026" };
  }

  const pmpOnly = /^pmp$/i.test(exam);
  const pool = pmpOnly ? LENS_CHIPS : LENS_CHIPS.filter((c) => !c.label.startsWith("PMP"));
  return pool[stableIndex(post.id || hook, pool.length)];
}
