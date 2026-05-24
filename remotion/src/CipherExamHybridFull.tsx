import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { TopBar } from './TopBar';
import { Caption } from './Caption';
import { EndCard } from './EndCard';

// ────────────────────────────────────────────────────────────────────────────
// CipherExamHybridFull — Three-act ad with chunks 2 + 3.
// ────────────────────────────────────────────────────────────────────────────
// Like HybridLite but extends the human-warmth arc by adding chunk 3 (the
// sustained-smile outcome beat). Chunk 1 stays retired (its Veo artifacts
// are unsalvageable). Cost-anchor is owned by motion graphics.
//
// TIMELINE (24fps):
//   0  →  72   (0–3s)    COST-ANCHOR motion graphics
//  60  → 192   (2.5–8s)  chunk2.mp4 (Veo pivot — dawning smile + CipherExam UI)
// 180  → 312   (7.5–13s) chunk3.mp4 (Veo outcome — sustained warm smile)
// 300  → 384   (12.5–16s) end card
// ────────────────────────────────────────────────────────────────────────────

const COST_ANCHOR_DURATION = 72;       // 3s
const HANDOFF_OVERLAP = 12;            // 0.5s cross-dissolve
const CHUNK2_START = COST_ANCHOR_DURATION - HANDOFF_OVERLAP;
const CHUNK2_DURATION = 132;           // 5.5s (trimmed from 10s source)
const CHUNK3_START = CHUNK2_START + CHUNK2_DURATION - HANDOFF_OVERLAP;
const CHUNK3_DURATION = 132;           // 5.5s
const ENDCARD_START = CHUNK3_START + CHUNK3_DURATION - HANDOFF_OVERLAP;
const ENDCARD_DURATION = 84;           // 3.5s

export const HYBRID_FULL_DURATION = ENDCARD_START + ENDCARD_DURATION;

export type CipherExamHybridFullProps = {
  chunk2Src: string;
  chunk3Src: string;
  examName: string;
  examPrice: string;
  pivotCaption: string;
  outcomeCaption: string;
  endCardLine1: string;
  endCardLine2: string;
  endCardLine3: string;
};

export const HYBRID_FULL_DEFAULTS: CipherExamHybridFullProps = {
  chunk2Src: staticFile('chunk2.mp4'),
  chunk3Src: staticFile('chunk3.mp4'),
  examName: 'PMP',
  examPrice: '$425',
  pivotCaption: 'Prepare with CipherExam.',
  outcomeCaption: 'Pass the first time.',
  endCardLine1: 'Free 7-day trial.',
  endCardLine2: 'cipherexam.com',
  endCardLine3: 'No credit card required.',
};

export const CipherExamHybridFull: React.FC<CipherExamHybridFullProps> = ({
  chunk2Src,
  chunk3Src,
  examName,
  examPrice,
  pivotCaption,
  outcomeCaption,
  endCardLine1,
  endCardLine2,
  endCardLine3: _endCardLine3,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#020617', overflow: 'hidden' }}>
      {/* ─── BEAT 1 — Cost-anchor motion graphics ─── */}
      <Sequence from={0} durationInFrames={COST_ANCHOR_DURATION}>
        <CostAnchorScene examName={examName} examPrice={examPrice} />
      </Sequence>

      {/* ─── BEAT 2 — Veo chunk 2 (pivot/dawning smile + CipherExam UI) ─── */}
      <Sequence from={CHUNK2_START} durationInFrames={CHUNK2_DURATION + HANDOFF_OVERLAP}>
        <VideoLayer src={chunk2Src} fadeInFrames={HANDOFF_OVERLAP} fadeOutAt={CHUNK2_DURATION} />
      </Sequence>

      {/* ─── BEAT 3 — Veo chunk 3 (sustained smile, outcome) ─── */}
      <Sequence from={CHUNK3_START} durationInFrames={CHUNK3_DURATION + HANDOFF_OVERLAP}>
        <VideoLayer src={chunk3Src} fadeInFrames={HANDOFF_OVERLAP} fadeOutAt={CHUNK3_DURATION} />
      </Sequence>

      {/* ─── PERSISTENT BRAND HEADER (only over Veo footage — cost anchor + end card own their own layout) ─── */}
      <Sequence
        from={CHUNK2_START}
        durationInFrames={CHUNK2_DURATION + CHUNK3_DURATION - HANDOFF_OVERLAP - HANDOFF_OVERLAP}
      >
        <TopBar />
      </Sequence>

      {/* ─── CAPTION 1 — over chunk 2 (pivot beat) ─── */}
      <Sequence
        from={CHUNK2_START + HANDOFF_OVERLAP + 18}
        durationInFrames={CHUNK2_DURATION - 30}
      >
        <Caption text={pivotCaption} accent />
      </Sequence>

      {/* ─── CAPTION 2 — over chunk 3 (outcome beat) ─── */}
      <Sequence
        from={CHUNK3_START + HANDOFF_OVERLAP + 12}
        durationInFrames={CHUNK3_DURATION - 24}
      >
        <Caption text={outcomeCaption} />
      </Sequence>

      {/* ─── END CARD ─── */}
      <Sequence from={ENDCARD_START} durationInFrames={ENDCARD_DURATION}>
        <EndCard line1={endCardLine1} line2={endCardLine2} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Reusable video layer with fade-in and fade-out for clean cross-dissolves.
// ────────────────────────────────────────────────────────────────────────────
const VideoLayer: React.FC<{ src: string; fadeInFrames: number; fadeOutAt: number }> = ({
  src,
  fadeInFrames,
  fadeOutAt,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, fadeInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [fadeOutAt, fadeOutAt + fadeInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      <OffthreadVideo src={src} muted />
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Cost-anchor scene (same as HybridLite — duplicated to avoid cross-file coupling)
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

  const fadeOut = interpolate(frame, [60, 72], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
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

      <div
        style={{
          position: 'absolute',
          top: 32,
          left: 40,
          fontFamily: '"Satoshi", "General Sans", system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 32,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          opacity: logoP,
        }}
      >
        CipherExam
      </div>

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
