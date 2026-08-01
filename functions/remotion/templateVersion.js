// Bump this whenever the post-video template changes in a way that makes
// already-rendered MP4s look outdated (layout, CTA timing, chip rules,
// formats, wording). Renders stamp it onto the post as
// `videoTemplateVersion`; the dashboard flags any video whose stamp is
// behind the newest one it can see and offers to regenerate those.
//
// Existing MP4s are frozen files — a template change never retro-applies,
// which caused real confusion on 2026-07-31 when several videos silently
// kept an older look after edits.
//
// History:
//   1 — initial single-beat template (hook + price pill + button CTA)
//   2 — text CTA (no fake button), logo mark, "EXAM FEE" label,
//       CTA fully visible at 2.0s
//   3 — weekly format rotation + contextual chip (hook-slug classified)
export const VIDEO_TEMPLATE_VERSION = 3;
