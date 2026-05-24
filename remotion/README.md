# cipher-marketing / remotion

Programmatic compositing for CipherExam ad videos. Takes AI-generated clips from Veo / Google AI Studio, stitches them together, burns reliable captions, persists the CipherExam logo, and renders a brand-consistent end card.

**Why this exists:** Veo generates great photoreal clips but unreliable text overlays (typos like "PMP cones $425"). This project keeps Veo focused on what it's good at (humans + visuals) and handles all text + branding here.

## Setup (one time)

```bash
cd G:\Users\daveq\cipher-marketing\remotion
npm install
```

## Drop your clips in `public/`

After generating each Veo clip in Google AI Studio:

```
public/chunk1.mp4   ← STRUGGLE (8 s)
public/chunk2.mp4   ← PIVOT/CLARITY (8 s)
```

## Preview in the browser

```bash
npm run studio
```

Opens the Remotion Studio at `http://localhost:3000`. Scrub the timeline, tweak props live (caption text, end-card lines), see changes instantly.

## Render the final MP4

```bash
npm run render
# → out/cipherexam-ad.mp4
```

Or with extra ffmpeg compression for smaller file size:

```bash
npm run render:compressed
```

## Timeline (24 fps)

| Frames | Time | Beat | Caption |
|---|---|---|---|
| 0 – 168 | 0 – 7 s | chunk1 (struggle) | "PMP costs $425." |
| 156 – 192 | 6.5 – 8 s | cross-dissolve overlap | — |
| 168 – 336 | 7 – 14 s | chunk2 (pivot/clarity) | "Prepare with CipherExam." |
| 336 – 408 | 14 – 17 s | end card | "Pass the first time." + cipherexam.com |

Total: **17 seconds** — LinkedIn / X sweet spot.

## Tweaking via defaultProps

Open `src/CipherExamAd.tsx`. The `AD_DEFAULTS` object exposes:

- `caption1`, `caption2` — the burned-in captions
- `endCardLine1`, `endCardLine2` — final brand card text

Change them per-cert without touching component code:

- **PMP:** "PMP costs $425." / "Prepare with CipherExam." / "Pass the first time."
- **Security+:** "Security+ costs $404." / "Prepare with CipherExam." / "Pass the first time."
- **SHRM-CP:** "SHRM-CP costs $410." / "Prepare with CipherExam." / "Pass the first time."

The Studio UI lets you edit these live in the right panel and re-render without code changes.

## Per-cert batch render (later)

Once a few cert variants are dialed in, add additional `<Composition>` entries to `src/Root.tsx` (one per cert) and render the whole set:

```bash
npx remotion render src/index.ts CipherExamAd_PMP out/pmp.mp4
npx remotion render src/index.ts CipherExamAd_SecPlus out/sec-plus.mp4
npx remotion render src/index.ts CipherExamAd_SHRMCP out/shrm-cp.mp4
```

## Brand checklist (already wired)

- ✅ Background: `#020617` (verified cipherexam.com slate)
- ✅ Fonts: Satoshi + General Sans (per brand spec — system-ui fallback)
- ✅ Accent gradient: `from-brand-400` → `blue-500` (matches Landing.tsx hero gradient)
- ✅ CipherExam wordmark: one word, both caps
- ✅ Logo persists over both clips, retires during end-card
- ✅ Source resolution 1280×720 @ 24 fps to match Veo output (no frame interpolation)

## Open question to lock with Dave

- **Add background music?** Currently no audio layer — videos are silent over their own muted clips. Could add a soft synth pad track in `public/bgm.mp3` and layer with `<Audio>`. Discuss before adding.
- **End-card duration** — 3 s currently. Some platforms (Reels) prefer 2 s end-cards. Easy to tune via `ENDCARD_DURATION` in CipherExamAd.tsx.

## Pure motion-graphics compositions (no Veo needed)

Three per-cert variants ship-ready without any AI video generation. Each is 17 seconds, 1920×1080, ~1.7MB.

```bash
npm run motion:pmp        # PMP variant      → out/cipherexam-motion-pmp.mp4
npm run motion:secplus    # Security+ variant → out/cipherexam-motion-secplus.mp4
npm run motion:shrmcp     # SHRM-CP variant   → out/cipherexam-motion-shrmcp.mp4
npm run motion:all        # All three in sequence
```

Or render with a custom cost-anchor:

```bash
npx remotion render src/index.ts CipherExamMotionAd out/custom.mp4 \
  --props='{"examName":"CISSP","examPrice":"$749","reframeLine":"Most candidates retake it.","productLine":"Learn how the exam thinks.","outcomeLine":"Pass the first time.","ctaUrl":"cipherexam.com"}'
```

**Story arc (17 seconds, 30 fps):**

| Time | Beat | Content |
|---|---|---|
| 0–3 s | Cost anchor | "[Exam] costs / $[price] / to sit." — big white number on slate |
| 3–6 s | Reframe | "Most candidates fail." — large coral-red, lands hard |
| 6–11 s | Product reveal | Mock Exam Lens explanation card + "Learn how the exam thinks." in brand gradient |
| 11–17 s | End card | CipherExam wordmark + "Pass the first time." + cipherexam.com + "Free 7-day trial · No credit card" |

Logo persists top-left throughout. No human-actor footage. No Veo quota burned. Renders in under a minute per variant.

## Render notes

- Requires Chrome / Chromium on the local machine (Remotion uses Puppeteer for rendering).
- First render is slow (~2 min) as Chrome warms up. Subsequent renders are faster.
- For 1920×1080 output (Veo Pro), bump `width`/`height` in `src/Root.tsx`.
