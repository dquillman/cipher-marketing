import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { TopBar } from './TopBar';
import { Caption } from './Caption';
import { EndCard } from './EndCard';

// ────────────────────────────────────────────────────────────────────────────
// CipherExamSingleChunkAd — Hybrid ad using ONLY chunk1.mp4.
// For when you have a single Veo clip + want to add Remotion polish + end card.
// Skips the chunk2 pivot — end card comes directly after chunk1.
// ────────────────────────────────────────────────────────────────────────────
//   0 → 192   (0–8s)   chunk1 (struggle clip) + caption "PMP costs $425."
// 180 → 264   (7.5–11s) end card "Pass the first time." + cipherexam.com
//                       (overlaps last 0.5s of clip for clean cross-dissolve)
// ────────────────────────────────────────────────────────────────────────────

const CHUNK1_DURATION = 192;        // 8s @ 24fps
const ENDCARD_OVERLAP = 12;         // 0.5s overlap
const ENDCARD_START = CHUNK1_DURATION - ENDCARD_OVERLAP;
const ENDCARD_DURATION = 72;        // 3s

export const SINGLE_CHUNK_AD_DURATION = ENDCARD_START + ENDCARD_DURATION;

export type CipherExamSingleChunkAdProps = {
  chunk1Src: string;
  caption: string;
  endCardLine1: string;
  endCardLine2: string;
};

export const SINGLE_CHUNK_AD_DEFAULTS: CipherExamSingleChunkAdProps = {
  chunk1Src: staticFile('chunk1.mp4'),
  caption: 'PMP costs $425.',
  endCardLine1: 'Pass the first time.',
  endCardLine2: 'cipherexam.com',
};

export const CipherExamSingleChunkAd: React.FC<CipherExamSingleChunkAdProps> = ({
  chunk1Src,
  caption,
  endCardLine1,
  endCardLine2,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#020617' }}>
      {/* ─── CHUNK 1 with fade-out for end-card transition ─── */}
      <Sequence from={0} durationInFrames={CHUNK1_DURATION}>
        <ChunkLayer src={chunk1Src} />
      </Sequence>

      {/* ─── PERSISTENT BRAND HEADER (covers Veo's top-corner text artifacts) ─── */}
      <Sequence from={0} durationInFrames={ENDCARD_START}>
        <TopBar />
      </Sequence>

      {/* ─── CAPTION — carries the clean message in the bottom third ─── */}
      <Sequence from={24} durationInFrames={CHUNK1_DURATION - 36}>
        <Caption text={caption} />
      </Sequence>

      {/* ─── END CARD ─── */}
      <Sequence from={ENDCARD_START} durationInFrames={ENDCARD_DURATION}>
        <EndCard line1={endCardLine1} line2={endCardLine2} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Chunk with fade-out at the end for cross-dissolve to end-card.
const ChunkLayer: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [CHUNK1_DURATION - ENDCARD_OVERLAP, CHUNK1_DURATION],
    [1, 0.3],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo src={src} muted />
    </AbsoluteFill>
  );
};
