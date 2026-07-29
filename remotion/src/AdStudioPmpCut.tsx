import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { BrandLogo } from './BrandLogo';
import { Caption } from './Caption';
import { EndCard } from './EndCard';

// ad-studio pmp-30s-202607 — "The Second-Guess" 15s cut + overlays + end card.
// Live action = public/adstudio-pmp-master.mp4 (silent master, 15.083s @ 24fps).
// Audio (VO + bgm) is muxed afterward with FFmpeg; this composition renders silent.

const FPS = 24;
const LIVE_FRAMES = 362; // 15.083s
export const AD_STUDIO_PMP_CUT_DURATION = LIVE_FRAMES + 84; // + 3.5s end card = 446

// Captions timed to the VO beats (VO starts at 1s in the final mix).
const CAPTIONS: Array<{ from: number; to: number; text: string; accent?: boolean }> = [
  { from: 24, to: 96, text: 'You know the material.' },
  { from: 96, to: 192, text: "But PMP doesn't test what you know — it tests how you judge." },
  { from: 204, to: 288, text: 'CipherExam shows the reasoning behind every answer.' },
  // No accent on the closer: gradient text disappears against the bright laptop
  // lid in the S5/S6 close-ups — white-with-shadow reads; the gradient moment
  // belongs to the end card.
  { from: 300, to: LIVE_FRAMES, text: 'Learn how the exam thinks.' },
];

// Upper-right exam badge — letters slide in individually from the right,
// staggered, inside the same dark pill treatment as the BrandLogo so it
// stays readable against the bright pendant lamp in the wide shots.
const ExamBadge: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pillP = spring({ frame: frame - 6, fps, config: { damping: 100, stiffness: 200 } });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        padding: '24px 32px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          overflow: 'hidden',
          opacity: pillP,
          background: 'rgba(2, 6, 23, 0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          padding: '14px 24px',
          borderRadius: 999,
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        {label.split('').map((letter, i) => {
          const p = spring({
            frame: frame - 12 - i * 7,
            fps,
            config: { damping: 100, stiffness: 200 },
          });
          const x = interpolate(p, [0, 1], [90, 0]);
          return (
            <span
              key={i}
              style={{
                fontFamily: '"Satoshi", "General Sans", system-ui, sans-serif',
                fontWeight: 800,
                fontSize: 36,
                letterSpacing: '0.06em',
                lineHeight: 1,
                background: 'linear-gradient(135deg, #818cf8 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                opacity: p,
                transform: `translateX(${x}px)`,
                display: 'inline-block',
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const AdStudioPmpCut: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#020617' }}>
    {/* Live action */}
    <Sequence from={0} durationInFrames={LIVE_FRAMES}>
      <OffthreadVideo src={staticFile('adstudio-pmp-master.mp4')} muted />
    </Sequence>

    {/* Persistent brand pill over the live action (end card carries its own logo) */}
    <Sequence from={0} durationInFrames={LIVE_FRAMES}>
      <BrandLogo variant="top-left" />
    </Sequence>

    {/* Exam badge, upper right — letters slide in from the right */}
    <Sequence from={0} durationInFrames={LIVE_FRAMES}>
      <ExamBadge label="PMP" />
    </Sequence>

    {/* Burned-in captions for muted autoplay */}
    {CAPTIONS.map((c) => (
      <Sequence key={c.from} from={c.from} durationInFrames={c.to - c.from}>
        <Caption text={c.text} accent={c.accent} />
      </Sequence>
    ))}

    {/* End card */}
    <Sequence from={LIVE_FRAMES} durationInFrames={84}>
      <EndCard
        line1="Learn how the exam thinks."
        line2="Start Free Trial · No credit card required · cipherexam.com/lp/pmp"
      />
    </Sequence>
  </AbsoluteFill>
);
