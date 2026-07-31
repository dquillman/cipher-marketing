// Cert exam sit-fee cost anchors, used as the price overlay in post-to-video
// renders. These are the REAL exam registration fees (not CipherExam's own
// $19/mo price) — the cost-anchor tactic locked in cipher-exam-context:
// "PMP costs $425 to sit." Source: remotion/README.md timeline table +
// cipher-exam-context skill "Video creative direction" section.
export const EXAM_SIT_FEES: Record<string, number> = {
  PMP: 425,
  "Security+": 404,
  "SHRM-CP": 410,
};

export function lookupExamSitFee(examFocus: string | undefined | null): number | null {
  if (!examFocus) return null;
  if (EXAM_SIT_FEES[examFocus] != null) return EXAM_SIT_FEES[examFocus];
  const normalized = examFocus.trim().toLowerCase();
  const match = Object.keys(EXAM_SIT_FEES).find(
    (k) => k.toLowerCase() === normalized
  );
  return match ? EXAM_SIT_FEES[match] : null;
}
