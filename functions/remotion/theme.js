// Deploy-scoped copy of videos/src/components/theme.ts, kept in sync by hand.
// Duplicated (not imported across the sibling videos/ project) because
// `firebase deploy --only functions` only packages the functions/ directory —
// sibling folders aren't included in the deploy bundle.
export const theme = {
  bg: "#060B16",
  bgElev: "#0B1526",
  bgElev2: "#101E36",
  fg: "#E9EEF6",
  fgDim: "#8A9AB5",
  fgMuted: "#55688C",
  accent: "#43E5FF",
  accentPurple: "#FFB224",
  warn: "#FFB224",
  good: "#34D399",
  bad: "#F87171",
  border: "#1B2A44",
};
