# CipherExam — Cluster Videos (Remotion)

Cert-specific videos for the **Tier 1 campaign clusters**: PMP, CompTIA Security+, and SHRM-CP. Built with [Remotion](https://www.remotion.dev/).

## Three video formats × three Tier 1 certs = nine renders

| Format | Length | Size | Use |
|---|---|---|---|
| `launch-teaser-{cert}` | 12s @ 30fps · 1080×1080 (1:1) | ~1 MB | LinkedIn + X cluster-launch promo |
| `ai-tutor-demo-{cert}` | 25s @ 30fps · 1080×1920 (9:16) | ~2 MB | Reels / Shorts / TikTok / LinkedIn video |
| `domain-weights-{cert}` | 15s @ 30fps · 1080×1080 (1:1) | ~1.5 MB | Mid-week tactical / explainer |

Cert codes:
- `pmp` — PMP (PMI). PMI Decision Lens, ECO domain weights, scenario question.
- `secplus` — CompTIA Security+ (SY0-701). Security Triad Lens, SY0-701 domain weights, login-anomaly question.
- `shrm` — SHRM-CP. SHRM Competency Lens, Functional Knowledge vs. Behavioral split, manager-employee scenario.

All cert-specific content (lens label, scenario question, options, explanation, domain weights, callout) lives in [`src/data/examVariants.ts`](src/data/examVariants.ts). Components read from there via a `variant` prop — to add a Tier 2 cert, add a config entry and append the variant code to `TIER_1` in `Root.tsx`. No component edits needed.

## One-time setup

```bash
cd marketing/cipher-exam-launch/videos
npm install
```

## Preview interactively

```bash
npm run studio
```

Pick any composition from the sidebar. Re-render with the green button.

## Render to MP4

Per cluster:

```bash
npm run render:pmp        # → 3 PMP videos
npm run render:secplus    # → 3 Security+ videos
npm run render:shrm       # → 3 SHRM-CP videos
```

All 9 at once:

```bash
npm run render:all
```

Or one composition at a time:

```bash
npx remotion render src/index.ts launch-teaser-pmp out/launch-teaser-pmp.mp4
```

## File map

```
videos/
├── src/
│   ├── index.ts                        # Remotion entry
│   ├── Root.tsx                        # Registers 9 compositions (3 formats × 3 certs)
│   ├── fonts.css                       # Fontshare @import (Satoshi + General Sans)
│   ├── data/
│   │   └── examVariants.ts             # Per-cert config (lens, question, domains, callout)
│   └── components/
│       ├── theme.ts                    # Brand palette (#020617 bg, cyan/purple accents)
│       ├── fonts.ts                    # Font-family string exports
│       ├── LaunchTeaser.tsx            # 12s 1:1 promo (variant-aware)
│       ├── AiTutorDemo.tsx             # 25s 9:16 demo (variant-aware)
│       └── DomainWeights.tsx           # 15s 1:1 chart (variant-aware)
├── out/                                # Rendered MP4s (gitignored)
├── package.json
├── tsconfig.json
└── remotion.config.ts
```

## Adding a Tier 2 cert (CSM, Network+, Six Sigma GB, etc.)

1. Add an entry to `VARIANTS` in `src/data/examVariants.ts` with the cert's Decision Lens, a scenario question, and domain weights.
2. Add the variant code to the `TIER_1` array in `src/Root.tsx` (or rename the array — it's just the list of registered variants).
3. `npm run studio` to preview, then add a `render:{cert}` script in `package.json`.

## Brand

- Background: `#020617` (verified from cipherexam.com raw HTML)
- Fonts: Satoshi (headings 700/800) + General Sans (body 400/500), Fontshare CDN
- Accent: `#7dd3fc` (cyan) / `#a78bfa` (purple highlights)

## Notes

- The Tier 1 priority (PMP / Security+ / SHRM-CP) comes from the campaign brief at [`../00-campaign-brief.md`](../00-campaign-brief.md), which scored all 11 live exams against the CipherExam product wedge.
- Concurrency is pinned to 1 for Windows stability.
- `out/` is gitignored — upload finished MP4s to Drive / Notion / the campaign asset library, don't commit.
