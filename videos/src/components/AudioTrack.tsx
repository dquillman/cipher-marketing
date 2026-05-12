import { Audio, staticFile, useVideoConfig, interpolate, useCurrentFrame } from "remotion";
import { AUDIO, type AudioCategory } from "../config/audio";

/**
 * Drop-in audio component for any composition. Renders nothing when
 * `AUDIO.enabled === false`, so compositions can include it
 * unconditionally and still ship silent until real MP3s land.
 *
 * Handles fade-in / fade-out automatically based on the composition's
 * own duration — no per-composition timing math needed.
 */
export const AudioTrack: React.FC<{ category: AudioCategory }> = ({ category }) => {
  if (!AUDIO.enabled) return null;
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeFrames = Math.round(fps * AUDIO.fadeSeconds);
  const base = AUDIO.volumeOverride[category] ?? AUDIO.baseVolume;

  // Fade in over first `fadeFrames`, fade out over last `fadeFrames`.
  // Middle stays at base. Clamped at both ends so the value never
  // dips below 0 or above base.
  const fadeIn = interpolate(frame, [0, fadeFrames], [0, base], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fadeFrames, durationInFrames],
    [base, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const volume = Math.min(fadeIn, fadeOut);

  return <Audio src={staticFile(AUDIO.files[category])} volume={volume} />;
};
