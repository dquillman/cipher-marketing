import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { Logo } from './Logo';
import { Caption } from './Caption';
import { EndCard } from './EndCard';

// ────────────────────────────────────────────────────────────────────────────
// TIMELINE (24fps)
// ────────────────────────────────────────────────────────────────────────────
//   0 →  168  (0–7s)   chunk1 (STRUGGLE)        + caption "PMP costs $425."
// 156 →  192  (6.5–8s) cross-dissolve overlap
// 168 →  336  (7–14s)  chunk2 (PIVOT/CLARITY)   + caption "Prepare with CipherExam."
// 336 →  408  (14–17s) end card                 + "Pass the first time." + cipherexam.com
// ────────────────────────────────────────────────────────────────────────────
export const CHUNK1_START = 0;
export const CHUNK1_DURATION = 168;        // 7s
export const CROSSFADE_DURATION = 12;      // 0.5s
export const CHUNK2_START = CHUNK1_DURATION - CROSSFADE_DURATION; // overlap last 0.5s
export const CHUNK2_DURATION = 168;        // 7s
export const ENDCARD_START = CHUNK2_START + CHUNK2_DURATION;
export const ENDCARD_DURATION = 72;        // 3s
export const AD_DURATION_FRAMES = ENDCARD_START + ENDCARD_DURATION;

export type CipherExamAdProps = {
  chunk1Src: string;
  chunk2Src: string;
  caption1: string;
  caption2: string;
  endCardLine1: string;
  endCardLine2: string;
};

export const AD_DEFAULTS: CipherExamAdProps = {
  chunk1Src: staticFile('chunk1.mp4'),
  chunk2Src: staticFile('chunk2.mp4'),
  caption1: 'PMP costs $425.',
  caption2: 'Prepare with CipherExam.',
  endCardLine1: 'Pass the first time.',
  endCardLine2: 'cipherexam.com',
};

export const CipherExamAd: React.FC<CipherExamAdProps> = ({
  chunk1Src,
  chunk2Src,
  caption1,
  caption2,
  endCardLine1,
  endCardLine2,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#020617' }}>
      {/* ─── CHUNK 1: STRUGGLE ─── */}
      <Sequence from={CHUNK1_START} durationInFrames={CHUNK1_DURATION + CROSSFADE_DURATION}>
        <Chunk1Layer src={chunk1Src} />
      </Sequence>

      {/* ─── CHUNK 2: PIVOT/CLARITY ─── */}
      <Sequence from={CHUNK2_START} durationInFrames={CHUNK2_DURATION + CROSSFADE_DURATION}>
        <Chunk2Layer src={chunk2Src} />
      </Sequence>

      {/* ─── PERSISTENT LOGO (over both clips, hidden during end card) ─── */}
      <Sequence from={0} durationInFrames={ENDCARD_START}>
        <Logo />
      </Sequence>

      {/* ─── CAPTION 1 (during chunk 1) ─── */}
      <Sequence from={CHUNK1_START + 18} durationInFrames={CHUNK1_DURATION - 18}>
        <Caption text={caption1} />
      </Sequence>

      {/* ─── CAPTION 2 (during chunk 2) ─── */}
      <Sequence from={CHUNK2_START + CROSSFADE_DURATION + 12} durationInFrames={CHUNK2_DURATION - 24}>
        <Caption text={caption2} accent />
      </Sequence>

      {/* ─── END CARD ─── */}
      <Sequence from={ENDCARD_START} durationInFrames={ENDCARD_DURATION}>
        <EndCard line1={endCardLine1} line2={endCardLine2} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Chunk 1 with fade-out at the end for cross-dissolve into chunk 2
const Chunk1Layer: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [CHUNK1_DURATION, CHUNK1_DURATION + CROSSFADE_DURATION],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo src={src} muted />
    </AbsoluteFill>
  );
};

// Chunk 2 with fade-in at the start for cross-dissolve from chunk 1
const Chunk2Layer: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, CROSSFADE_DURATION],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo src={src} muted />
    </AbsoluteFill>
  );
};
