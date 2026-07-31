// Deploy-scoped copy of videos/src/data/examPricing.ts — see theme.js for why.
export const EXAM_SIT_FEES = {
  PMP: 425,
  "Security+": 404,
  "SHRM-CP": 410,
};

export function lookupExamSitFee(examFocus) {
  if (!examFocus) return null;
  if (EXAM_SIT_FEES[examFocus] != null) return EXAM_SIT_FEES[examFocus];
  const normalized = examFocus.trim().toLowerCase();
  const match = Object.keys(EXAM_SIT_FEES).find((k) => k.toLowerCase() === normalized);
  return match ? EXAM_SIT_FEES[match] : null;
}
