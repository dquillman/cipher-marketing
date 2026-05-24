import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

// ────────────────────────────────────────────────────────────────────────────
// CipherExamMotionAd — Pure motion-graphics ad. No human-actor footage needed.
// ────────────────────────────────────────────────────────────────────────────
// 17 seconds @ 30fps = 510 frames. (30fps is fine here — no video source to match.)
// Story: cost-anchor → reframe → CipherExam reveal → outcome.
// One composition, fully data-driven per-cert via props (PMP / Sec+ / SHRM-CP).
//
// TIMELINE:
//   0–90    (0–3s)    Beat 1: "$X to sit." — cost anchor lands big
//   90–180  (3–6s)    Beat 2: "Most candidates fail." — reframe
//   180–330 (6–11s)   Beat 3: CipherExam UI mockup + "Learn how it thinks."
//   330–510 (11–17s)  Beat 4: End card — "Pass the first time." + URL
// ────────────────────────────────────────────────────────────────────────────

export const MOTION_AD_DURATION = 510;

export type CipherExamMotionAdProps = {
  examName: string;
  examPrice: string;      // e.g., "$425"
  reframeLine: string;    // e.g., "Most candidates fail."
  productLine: string;    // e.g., "Learn how the exam thinks."
  outcomeLine: string;    // e.g., "Pass the first time."
  ctaUrl: string;         // e.g., "cipherexam.com"
};

export const MOTION_AD_DEFAULTS: CipherExamMotionAdProps = {
  examName: 'PMP',
  examPrice: '$425',
  reframeLine: 'Most candidates fail.',
  productLine: 'Learn how the exam thinks.',
  outcomeLine: 'Pass the first time.',
  ctaUrl: 'cipherexam.com',
};

// ─── Per-cert variant presets ───────────────────────────────────────────────
export const PMP_VARIANT: CipherExamMotionAdProps = {
  examName: 'PMP',
  examPrice: '$425',
  reframeLine: 'Most candidates fail.',
  productLine: 'Learn how the exam thinks.',
  outcomeLine: 'Pass the first time.',
  ctaUrl: 'cipherexam.com',
};

export const SECURITY_PLUS_VARIANT: CipherExamMotionAdProps = {
  examName: 'Security+',
  examPrice: '$404',
  reframeLine: 'Most candidates retake it.',
  productLine: 'Learn how the exam thinks.',
  outcomeLine: 'Pass the first time.',
  ctaUrl: 'cipherexam.com',
};

export const SHRM_CP_VARIANT: CipherExamMotionAdProps = {
  examName: 'SHRM-CP',
  examPrice: '$410',
  reframeLine: 'Most candidates fail judgment.',
  productLine: 'Learn how the exam thinks.',
  outcomeLine: 'Pass the first time.',
  ctaUrl: 'cipherexam.com',
};

// ────────────────────────────────────────────────────────────────────────────

export const CipherExamMotionAd: React.FC<CipherExamMotionAdProps> = ({
  examName,
  examPrice,
  reframeLine,
  productLine,
  outcomeLine,
  ctaUrl,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#020617', overflow: 'hidden' }}>
      {/* Atmospheric gradient blobs — same dual-blob feel as Landing.tsx hero */}
      <BackdropBlobs />

      {/* Persistent CipherExam logo top-left */}
      <Logo />

      {/* BEAT 1 — Cost anchor */}
      <Sequence from={0} durationInFrames={90}>
        <CostAnchorBeat examName={examName} examPrice={examPrice} />
      </Sequence>

      {/* BEAT 2 — Reframe */}
      <Sequence from={90} durationInFrames={90}>
        <ReframeBeat reframeLine={reframeLine} />
      </Sequence>

      {/* BEAT 3 — Product reveal */}
      <Sequence from={180} durationInFrames={150}>
        <ProductBeat productLine={productLine} />
      </Sequence>

      {/* BEAT 4 — End card */}
      <Sequence from={330} durationInFrames={180}>
        <EndBeat outcomeLine={outcomeLine} ctaUrl={ctaUrl} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Atmospheric backdrop — matches Landing.tsx hero gradient blobs
// ────────────────────────────────────────────────────────────────────────────
const BackdropBlobs: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 30;
  return (
    <>
      <AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            top: 100 + drift,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0) 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 250 - drift,
            left: '25%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0) 70%)',
            filter: 'blur(70px)',
          }}
        />
      </AbsoluteFill>
    </>
  );
};

// ────────────────────────────────────────────────────────────────────────────
const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 100, stiffness: 200 } });
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: '32px 40px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: '"Satoshi", "General Sans", system-ui, -apple-system, sans-serif',
          fontWeight: 700,
          fontSize: 32,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          opacity: p,
          transform: `translateY(${interpolate(p, [0, 1], [-8, 0])}px)`,
        }}
      >
        CipherExam
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// BEAT 1 — "PMP costs $425." The cost lands big, then settles.
// ────────────────────────────────────────────────────────────────────────────
const CostAnchorBeat: React.FC<{ examName: string; examPrice: string }> = ({
  examName,
  examPrice,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelP = spring({ frame: frame - 4, fps, config: { damping: 100, stiffness: 200 } });
  const priceP = spring({ frame: frame - 18, fps, config: { damping: 12, stiffness: 100 } });

  // Price impact — large at peak, settles to nominal.
  const priceScale = interpolate(priceP, [0, 0.5, 1], [0.6, 1.15, 1]);

  // Fade out at end for clean handoff to next beat.
  const fadeOut = interpolate(frame, [78, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 24,
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          fontFamily: '"General Sans", "Satoshi", system-ui, sans-serif',
          fontWeight: 500,
          fontSize: 48,
          color: '#94a3b8',
          letterSpacing: '0.02em',
          opacity: labelP,
          transform: `translateY(${interpolate(labelP, [0, 1], [16, 0])}px)`,
        }}
      >
        {examName} costs
      </div>
      <div
        style={{
          fontFamily: '"Satoshi", "General Sans", system-ui, sans-serif',
          fontWeight: 900,
          fontSize: 220,
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
          fontSize: 32,
          color: '#64748b',
          letterSpacing: '0.02em',
          opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      >
        to sit.
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// BEAT 2 — Reframe. Single line, hits hard.
// ────────────────────────────────────────────────────────────────────────────
const ReframeBeat: React.FC<{ reframeLine: string }> = ({ reframeLine }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 4, fps, config: { damping: 100, stiffness: 200 } });
  const fadeOut = interpolate(frame, [78, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: fadeOut }}>
      <div
        style={{
          fontFamily: '"Satoshi", "General Sans", system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 110,
          letterSpacing: '-0.03em',
          textAlign: 'center',
          color: '#f87171',
          opacity: p,
          transform: `translateY(${interpolate(p, [0, 1], [24, 0])}px) scale(${interpolate(p, [0, 1], [0.95, 1])})`,
          textShadow: '0 4px 24px rgba(248,113,113,0.3)',
          padding: '0 80px',
          maxWidth: '90%',
        }}
      >
        {reframeLine}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// BEAT 3 — Product reveal. Mock CipherExam UI card animates in, then headline.
// ────────────────────────────────────────────────────────────────────────────
const ProductBeat: React.FC<{ productLine: string }> = ({ productLine }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardP = spring({ frame: frame - 4, fps, config: { damping: 100, stiffness: 180 } });
  const lineP = spring({ frame: frame - 50, fps, config: { damping: 100, stiffness: 200 } });
  const fadeOut = interpolate(frame, [135, 150], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 48,
        opacity: fadeOut,
      }}
    >
      {/* Mock CipherExam UI card */}
      <div
        style={{
          width: 760,
          background: 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%)',
          borderRadius: 24,
          padding: '36px 40px',
          border: '1px solid rgba(99,102,241,0.3)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1) inset',
          opacity: cardP,
          transform: `translateY(${interpolate(cardP, [0, 1], [32, 0])}px) scale(${interpolate(cardP, [0, 1], [0.96, 1])})`,
        }}
      >
        <div
          style={{
            fontFamily: '"General Sans", system-ui, sans-serif',
            fontSize: 16,
            fontWeight: 700,
            color: '#818cf8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Exam Lens · PMI Decision Lens
        </div>
        <div
          style={{
            fontFamily: '"Satoshi", system-ui, sans-serif',
            fontSize: 28,
            fontWeight: 600,
            color: '#f1f5f9',
            lineHeight: 1.35,
            marginBottom: 24,
          }}
        >
          Why would PMI choose answer B over A?
        </div>
        <div
          style={{
            fontFamily: '"General Sans", system-ui, sans-serif',
            fontSize: 20,
            fontWeight: 400,
            color: '#94a3b8',
            lineHeight: 1.55,
          }}
        >
          PMI tests judgment, not memorization. Answer B aligns with stakeholder-first principles — the trap in A is the assumption that escalation is always the right first move.
        </div>
      </div>

      <div
        style={{
          fontFamily: '"Satoshi", system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 56,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #a5b4fc 0%, #60a5fa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: lineP,
          transform: `translateY(${interpolate(lineP, [0, 1], [16, 0])}px)`,
          padding: '0 40px',
        }}
      >
        {productLine}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// BEAT 4 — End card. Logo + outcome + URL.
// ────────────────────────────────────────────────────────────────────────────
const EndBeat: React.FC<{ outcomeLine: string; ctaUrl: string }> = ({
  outcomeLine,
  ctaUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wordmarkP = spring({ frame: frame - 6, fps, config: { damping: 100, stiffness: 200 } });
  const outcomeP = spring({ frame: frame - 20, fps, config: { damping: 100, stiffness: 200 } });
  const urlP = spring({ frame: frame - 32, fps, config: { damping: 100, stiffness: 200 } });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      <div
        style={{
          fontFamily: '"Satoshi", system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 64,
          color: '#ffffff',
          letterSpacing: '-0.03em',
          opacity: wordmarkP,
          transform: `translateY(${interpolate(wordmarkP, [0, 1], [16, 0])}px)`,
          marginBottom: 8,
        }}
      >
        CipherExam
      </div>

      <div
        style={{
          fontFamily: '"Satoshi", system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 80,
          letterSpacing: '-0.025em',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #818cf8 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: outcomeP,
          transform: `translateY(${interpolate(outcomeP, [0, 1], [16, 0])}px)`,
          padding: '0 40px',
        }}
      >
        {outcomeLine}
      </div>

      <div
        style={{
          fontFamily: '"General Sans", system-ui, sans-serif',
          fontWeight: 500,
          fontSize: 32,
          color: '#94a3b8',
          opacity: urlP,
          transform: `translateY(${interpolate(urlP, [0, 1], [12, 0])}px)`,
          marginTop: 16,
        }}
      >
        {ctaUrl}
      </div>

      {/* Tiny "no credit card" line for trust signal */}
      <div
        style={{
          fontFamily: '"General Sans", system-ui, sans-serif',
          fontWeight: 400,
          fontSize: 20,
          color: '#475569',
          opacity: interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          marginTop: 4,
        }}
      >
        Free 7-day trial · No credit card
      </div>
    </AbsoluteFill>
  );
};
