# Rendered videos — pick by where you're posting

Files are organized by **aspect ratio**, because ratio decides which platforms a
video fits. Same content can appear in more than one ratio folder (e.g. the
Coach demo exists as 4:5 for LinkedIn and 9:16 for X).

## Which folder for which post?

| Posting on… | Use folder | Why |
|---|---|---|
| **LinkedIn** (feed video/ad) | `4x5-portrait/` | LinkedIn's own recommended ratio — most feed real estate, shows on desktop **and** mobile |
| **X / Twitter** | `9x16-vertical/` or `1x1-square/` | vertical for mobile reach; square is the safe universal |
| **Reddit** (paid) | `1x1-square/` | square/native performs best; grab a still frame for static creative |
| **Link / display ads** | `1x1-square/` | universal, never cropped |
| **Reels / Shorts / TikTok** | `9x16-vertical/` | full-tall native |

⚠ **9:16 on LinkedIn shows to mobile users only** — never use it as a LinkedIn ad if you want desktop reach. Use `4x5-portrait/` instead.

## What's in each folder

- `4x5-portrait/` (1080×1350) — `ai-tutor-demo-{cert}` (Coach demo), `ad-all-four` (ad)
- `1x1-square/` (1080×1080) — `launch-teaser-{cert}`, `domain-weights-{cert}`, `ad-all-four` (ad)
- `9x16-vertical/` (1080×1920) — `ai-tutor-demo-{cert}` (Coach demo)

`{cert}` = `pmp` · `secplus` · `shrm`. Ad creatives are named by concept (`ad-all-four`).

## Re-rendering (outputs land here automatically)

```
npm run render:pmp      # or secplus / shrm — renders all four ratios for that cert
npm run render:ads      # the ad creatives (1:1 + 4:5)
npm run render:all      # everything
```

Rule: **LinkedIn = 4:5. Ads must be fully composed at frame 0** (see ../README.md).
