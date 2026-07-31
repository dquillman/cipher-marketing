// Deploy-scoped copy of videos/src/data/videoThemes.ts — see theme.js for why
// this is duplicated instead of imported from the sibling project. Keep the
// two files in sync by hand when a format is added or tweaked.

export const VIDEO_THEMES = [
  {
    id: "signal",
    label: "Signal",
    accent: "#43E5FF",
    bg: "radial-gradient(120% 90% at 50% 0%, #12314a 0%, #060B16 55%, #04070f 100%)",
    panel: "#0B1526",
    border: "#1B2A44",
    align: "center",
    grid: false,
    hookCard: false,
    accentBar: false,
    underline: false,
    pill: "outline",
  },
  {
    id: "blueprint",
    label: "Blueprint",
    accent: "#43E5FF",
    bg: "linear-gradient(160deg, #08182c 0%, #060B16 60%, #04070f 100%)",
    panel: "#0B1526",
    border: "#1F3557",
    align: "left",
    grid: true,
    hookCard: true,
    accentBar: false,
    underline: false,
    pill: "outline",
  },
  {
    id: "amber",
    label: "Amber",
    accent: "#FFB224",
    bg: "radial-gradient(120% 90% at 18% 0%, #2b1e08 0%, #0e0a05 55%, #060402 100%)",
    panel: "#1a1206",
    border: "#3a2a10",
    align: "left",
    grid: false,
    hookCard: false,
    accentBar: true,
    underline: false,
    pill: "solid",
  },
  {
    id: "split",
    label: "Split",
    accent: "#43E5FF",
    bg: "linear-gradient(180deg, #123047 0%, #0d2437 30%, #060B16 30%, #04070f 100%)",
    panel: "#0B1526",
    border: "#28527a",
    align: "center",
    grid: false,
    hookCard: false,
    accentBar: false,
    underline: false,
    pill: "outline",
  },
  {
    id: "spotlight",
    label: "Spotlight",
    accent: "#43E5FF",
    bg: "radial-gradient(70% 55% at 50% 62%, #1d4a6e 0%, #02040a 100%)",
    panel: "#0B1526",
    border: "#1B2A44",
    align: "center",
    grid: false,
    hookCard: false,
    accentBar: false,
    underline: true,
    pill: "outline",
  },
];

export function isoWeekIndex(dateStr) {
  if (!dateStr) return 0;
  const parts = String(dateStr).slice(0, 10).split("-").map(Number);
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return 0;
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return d.getUTCFullYear() * 53 + week;
}

export function pickTheme(scheduled, override) {
  if (override) {
    const forced = VIDEO_THEMES.find((t) => t.id === override);
    if (forced) return forced;
  }
  return VIDEO_THEMES[isoWeekIndex(scheduled) % VIDEO_THEMES.length];
}
