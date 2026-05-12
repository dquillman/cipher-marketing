# Music tracks (drop MP3s here)

Drop **four MP3 files** into this directory with these exact names:

```
audio/
├── launch-teaser.mp3      ← plays under launch-teaser-{pmp,secplus,shrm}.mp4 (12s)
├── ai-tutor-demo.mp3      ← plays under ai-tutor-demo-* (25s) + -li variants
├── domain-weights.mp3     ← plays under domain-weights-* (15s)
└── pbq-walkthrough.mp3    ← plays under pbq-walkthrough-secplus*.mp4 (30s)
```

After dropping the files, flip the switch in **`videos/src/config/audio.ts`**:

```ts
export const AUDIO = {
  enabled: false,   //  ← change to true
  ...
};
```

Then re-render: `cd videos && npm run render:all`

## Where to get free, commercial-OK music

- **Pixabay Music** — https://pixabay.com/music/ — free, no attribution, commercial OK
- **YouTube Audio Library** — free, some attribution required, commercial OK
- **Mixkit** — https://mixkit.co/free-stock-music/ — free, no attribution, commercial OK

## Vibe per track

| File | Search-term hints | Length needed |
|---|---|---|
| `launch-teaser.mp3` | "minimal corporate," "tech intro," "uplifting" — declarative, lands on a logo | ≥ 12s |
| `ai-tutor-demo.mp3` | "thinking ambient," "minimal piano," "contemplative" — supports reading, doesn't pull focus | ≥ 25s |
| `domain-weights.mp3` | "data viz," "minimal electronic," "clean pulse" — supports a chart filling in | ≥ 15s |
| `pbq-walkthrough.mp3` | "building tension," "puzzle solve," "rising-then-resolving" — short build → settle | ≥ 30s |

Tracks longer than the video duration are fine — they auto-fade out 0.5s before the video ends. The `AudioTrack` component handles fades automatically (0.5s in/out by default; configurable in `audio.ts`).

## Volume

Default mix is **0.25** (≈ -12 dBFS) — sits well under any future voice and on-device speakers. If one track mixes hotter than the others, drop a per-file override into `volumeOverride` in `audio.ts`:

```ts
volumeOverride: {
  teaser: 0.18,   // this one was clipping
}
```

## Why .gitignored

MP3 files are in `.gitignore` for this directory — they're external assets, not source code. Source them once, store locally (and back up via Drive / Dropbox / etc.). The repo stays lean.
