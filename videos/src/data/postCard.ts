/**
 * LinkedIn post-card data model + look selection.
 *
 * Four approved looks, locked 2026-08-25. Each look has a job:
 *   markedUp    — scenario / question posts (shows the tutor's pen: the product itself)
 *   diff        — Security+ posts (code-diff framing is native to that audience)
 *   ledger      — exam-change / news / milestone posts (printed-briefing authority)
 *   answerSheet — everything else (the default; scantron form reads as "exam" instantly)
 *
 * Every look ends in the same CTA bar. Signup is the only action on the card.
 */

export type PostCardLook = "ledger" | "answerSheet" | "diff" | "markedUp";

export const POST_CARD_LOOKS: PostCardLook[] = ["ledger", "answerSheet", "diff", "markedUp"];

// The rule that maps a post to a look lives in scripts/render-post-card.mjs,
// which is the only caller. This file stays types + shared CTA copy.

/** One answer option on the answerSheet / markedUp looks. */
export type CardOption = { letter: string; text: string };

/** One row on the diff look. kind drives the colour band. */
export type DiffRow = { kind: "minus" | "plus" | "context"; text: string };

export type PostCardProps = {
  look: PostCardLook;
  /** Small top-left label, e.g. "PMP · Exam Update". */
  eyebrow: string;
  /** Small top-right label, e.g. "July 9, 2026" or "SY0-701 → SY0-801". */
  meta: string;
  /** The one big line. Keep it under ~9 words — use \n to control line breaks. */
  headline: string;
  /** One supporting sentence. Optional on looks that carry options instead. */
  support?: string;

  /** ledger only — the was/now number pair. Omit both to drop the block. */
  statWas?: string;
  statNow?: string;
  statLabel?: string;

  /** answerSheet + markedUp — four options and the index (0-3) that scores. */
  options?: CardOption[];
  correctIndex?: number;
  /**
   * True when the post promises the answer in the first comment. The card
   * then hides the filled bubble, the red circle, the why and the margin
   * notes — showing them would give away the thing the post is gating and
   * make the copy read as a lie. The data is kept for the reveal card.
   */
  gated?: boolean;

  /** answerSheet — the "Why C" explanation. markedUp — the margin notes. */
  why?: string;
  marginNotes?: string[];

  /** diff only — the outline rows. */
  diffRows?: DiffRow[];
  /** diff only — "# " comment lines under the diff. */
  comments?: string[];

  /** CTA bar. Same on every look; overridable per campaign. */
  ctaLine?: string;
  ctaSub?: string;
};

export const CTA_LINE = "Start free at cipherexam.com";
// The URL always goes in the FIRST COMMENT on LinkedIn, gated or not — body
// links suppress reach (39 median impressions vs 209, measured across 18 posts).
// "link in this post" sent readers hunting through a body that never has one.
export const CTA_SUB = "7-day free trial · no credit card · link in the first comment";
