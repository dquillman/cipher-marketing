// Picks the top-right chip for a post video.
//
// The exam-fee cost anchor used to appear on EVERY video. That blunts it:
// a jolt only works when it's occasional, and on a news or poll post the
// price is irrelevant noise competing with the hook. Worse, pairing every
// impression with "$425" anchors the brand to the candidate's expense
// rather than to what CipherExam does. (Dave, 2026-07-31.)
//
// So the chip now states a fact that supports THAT post's argument, and the
// fee is reserved for posts actually about cost/risk/retakes — roughly one
// in four, which is what keeps it punchy.
//
// Mirrored by functions/remotion/postChip.js — keep the two in sync.

const FEE_WORDS = ["cost", "fee", "price", "retake", "fail", "wasted", "worth", "expensive", "money", "afford"];
const UPDATE_WORDS = ["changed", "change", "eco", "updated", "update", "new-exam", "business-environment", "july", "2026 exam"];
const QUIET_WORDS = ["poll", "challenge", "checklist", "quiz", "question-of"];

type ChipPost = { hook?: string | null; copy?: string | null };

export type PostChip = { label: string; value: string };

function haystack(post: ChipPost) {
  return [post.hook || "", post.copy || ""].join(" ").toLowerCase();
}

export function pickChip(
  post: ChipPost,
  examName?: string | null,
  examPrice?: number | null
): PostChip | null {
  const text = haystack(post);
  const exam = examName || "";

  if (FEE_WORDS.some((w) => text.includes(w)) && examPrice != null) {
    return { label: `${exam} exam fee`, value: `$${examPrice}` };
  }
  if (UPDATE_WORDS.some((w) => text.includes(w))) {
    return { label: `${exam} exam`, value: "UPDATED 2026" };
  }
  // Engagement posts (polls, challenges, checklists) carry no chip — the
  // hook is the whole point and a chip just competes with it.
  if (QUIET_WORDS.some((w) => text.includes(w))) {
    return null;
  }
  return { label: "Exam Lens", value: "WHY, NOT JUST WHAT" };
}
