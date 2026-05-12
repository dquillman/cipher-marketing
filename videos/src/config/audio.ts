/**
 * Audio configuration for Remotion compositions.
 *
 * v0: capability wired, no actual MP3s on disk yet. `enabled` is false,
 *     so videos render silently — same as before — until someone drops
 *     real MP3s into `videos/public/audio/` and flips this flag.
 *
 * Decision (2026-05-11): music only, no voice. ElevenLabs is overkill
 * for music; per-category royalty-free tracks from Pixabay or similar
 * are the recommended source. See `videos/public/audio/README.md` for
 * the four files needed and where to find them.
 *
 * One track per composition CATEGORY (not per cert) — same launch-teaser
 * music plays under PMP/Sec+/SHRM-CP teasers; same AI tutor demo music
 * plays under all six demo videos. This is intentional brand consistency
 * and keeps the asset count to 4 tracks total.
 */

export const AUDIO = {
  /**
   * Master switch. Flip to `true` once the four MP3s exist in
   * `videos/public/audio/`. Until then, every `<Audio>` element is
   * skipped and videos render silently.
   */
  enabled: false,

  /**
   * Base volume for the music underscore. 0.25 ≈ -12 dBFS — sits well
   * under any voice (future v2) and on-device speakers. Adjust per-file
   * via the `volumeOverride` map below if a specific track is louder
   * or quieter than expected.
   */
  baseVolume: 0.25,

  /**
   * Fade-in / fade-out duration in seconds. Applied at both ends of
   * each clip so audio never starts or stops abruptly.
   */
  fadeSeconds: 0.5,

  /**
   * Per-category MP3 paths, relative to `videos/public/`. Remotion's
   * `staticFile()` resolves these at render time.
   */
  files: {
    teaser:    "audio/launch-teaser.mp3",
    tutor:     "audio/ai-tutor-demo.mp3",
    domains:   "audio/domain-weights.mp3",
    pbq:       "audio/pbq-walkthrough.mp3",
  } as const,

  /**
   * Optional per-file volume override. Useful if one Pixabay track
   * mixes much louder than the others — drop a specific value here
   * to bring it in line. Empty by default.
   */
  volumeOverride: {} as Partial<Record<keyof typeof AUDIO_FILES, number>>,
} as const;

export type AudioCategory = keyof typeof AUDIO.files;

// Re-export the files type for the volumeOverride type above.
const AUDIO_FILES = AUDIO.files;
