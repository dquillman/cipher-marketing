import React from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { BrandLogo } from './BrandLogo';
import { Caption } from './Caption';
import { EndCard } from './EndCard';

// ────────────────────────────────────────────────────────────────────────────
// CipherExamHybridLite — Best-of-both-worlds composition.
// ────────────────────────────────────────────────────────────────────────────
// Avoids the "Veo chunk 1 had too many text artifacts to salvage" problem by
// owning the rational cost-anchor beat in pure motion graphics, then handing
// off to the clean Veo chunk 2 for the emotional pivot/clarity beat.
//
// TIMELINE (24fps):
//   0  →  72   (0–3s)   COST-ANCHOR motion graphics: "PMP costs $425 to sit."
//  60  → 252   (2.5–10.5s) chunk2.mp4 (Veo pivot/clarity) + caption
// 252  → 324   (10.5–13.5s) end card
// ────────────────────────────────────────────────────────────────────────────

const COST_ANCHOR_DURATION = 72;       // 3s
const HANDOFF_OVERLAP = 12;            // 0.5s cross-dissolve
const CHUNK2_START = COST_ANCHOR_DURATION - HANDOFF_OVERLAP;
const CHUNK2_DURATION = 192;           // 8s
const ENDCARD_OVERLAP = 12;
const ENDCARD_START = CHUNK2_START + CHUNK2_DURATION - ENDCARD_OVERLAP;
const ENDCARD_DURATION = 72;           // 3s

export const HYBRID_LITE_DURATION = ENDCARD_START + ENDCARD_DURATION;

export type CipherExamHybridLiteProps = {
  chunk2Src: string;
  examName: string;
  examPrice: string;
  productCaption: string;
  endCardLine1: string;
  endCardLine2: string;
};

export const HYBRID_LITE_DEFAULTS: CipherExamHybridLiteProps = {
  chunk2Src: staticFile('chunk2.mp4'),
  examName: 'PMP',
  examPrice: '$425',
  productCaption: 'Prepare with CipherExam.',
  endCardLine1: 'Pass the first time.',
  endCardLine2: 'cipherexam.com',
};

export const CipherExamHybridLite: React.FC<CipherExamHybridLiteProps> = ({
  chunk2Src,
  examName,
  examPrice,
  productCaption,
  endCardLine1,
  endCardLine2,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#020617', overflow: 'hidden' }}>
      {/* ─── BACKGROUND AUDIO — ambient pad, fades in/out ─── */}
      <Audio src={staticFile('bgm.mp3')} volume={0.85} />

      {/* ─── BEAT 1 — Cost-anchor motion graphics ─── */}
      <Sequence from={0} durationInFrames={COST_ANCHOR_DURATION}>
        <CostAnchorScene examName={examName} examPrice={examPrice} />
      </Sequence>

      {/* ─── BEAT 2 — Veo chunk 2 (clean pivot/clarity) ─── */}
      <Sequence from={CHUNK2_START} durationInFrames={CHUNK2_DURATION + ENDCARD_OVERLAP}>
        <Chunk2Layer src={chunk2Src} />
      </Sequence>

      {/* ─── PERSISTENT BRAND LOGO (covers Veo's plain-text logo — proper icon + wordmark) ─── */}
      <Sequence from={CHUNK2_START} durationInFrames={CHUNK2_DURATION - ENDCARD_OVERLAP}>
        <BrandLogo variant="top-left" gradient={false} />
      </Sequence>

      {/* ─── CAPTION on chunk 2 ─── */}
      <Sequence
        from={CHUNK2_START + HANDOFF_OVERLAP + 24}
        durationInFrames={CHUNK2_DURATION - 48}
      >
        <Caption text={productCaption} accent />
      </Sequence>

      {/* ─── END CARD ─── */}
      <Sequence from={ENDCARD_START} durationInFrames={ENDCARD_DURATION}>
        <EndCard line1={endCardLine1} line2={endCardLine2} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Compact 3-second cost-anchor scene (no logo overlap — owns the full frame)
// ────────────────────────────────────────────────────────────────────────────
const CostAnchorScene: React.FC<{ examName: string; examPrice: string }> = ({
  examName,
  examPrice,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoP = spring({ frame, fps, config: { damping: 100, stiffness: 200 } });
  const labelP = spring({ frame: frame - 4, fps, config: { damping: 100, stiffness: 200 } });
  const priceP = spring({ frame: frame - 14, fps, config: { damping: 12, stiffness: 100 } });
  const priceScale = interpolate(priceP, [0, 0.5, 1], [0.6, 1.1, 1]);

  // Fade out at end for clean handoff to chunk 2
  const fadeOut = interpolate(frame, [60, 72], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Atmospheric backdrop blob */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0) 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* CipherExam wordmark in the brand header position */}
      <BrandLogo variant="top-left" gradient={false} />

      {/* Centered cost-anchor stack */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: '"General Sans", "Satoshi", system-ui, sans-serif',
            fontWeight: 500,
            fontSize: 32,
            color: '#94a3b8',
            opacity: labelP,
            transform: `translateY(${interpolate(labelP, [0, 1], [12, 0])}px)`,
          }}
        >
          {examName} costs
        </div>
        <div
          style={{
            fontFamily: '"Satoshi", system-ui, sans-serif',
            fontWeight: 900,
            fontSize: 160,
            color: '#ffffff',
            letterSpacing: '-0.04em',
            opacity: priceP,
            transform: `scale(${priceScale})`,
            textShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {examPrice}
        </div>
        <div
          style={{
            fontFamily: '"General Sans", system-ui, sans-serif',
            fontWeight: 500,
            fontSize: 22,
            color: '#64748b',
            opacity: interpolate(frame, [24, 36], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          to sit.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Chunk 2 video layer with fade-in for clean cross-dissolve from the motion scene.
const Chunk2Layer: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, HANDOFF_OVERLAP], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(
    frame,
    [CHUNK2_DURATION - ENDCARD_OVERLAP, CHUNK2_DURATION],
    [1, 0.3],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return (
    <AbsoluteFill style={{ opacity: Math.min(opacity, fadeOut) }}>
      <OffthreadVideo src={src} muted />
    </AbsoluteFill>
  );
};
