import React from 'react';
import {
  AbsoluteFill,
  Img,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';

type BrandLogoProps = {
  /** Top-left persistent placement (over Veo footage) or center hero placement. */
  variant?: 'top-left' | 'hero';
  /** When true, uses the brand indigo→blue gradient on the wordmark. Default true. */
  gradient?: boolean;
  /** When true (default for top-left over video), wraps the logo in a subtle dark pill
      so it visually dominates and covers any Veo-rendered plain-text logo underneath. */
  pill?: boolean;
};

// Real CipherExam logo: brain icon + wordmark.
// Brain icon = `public/cipherexam-logo.png` (cyan/purple brain with green $).
// Wordmark uses the actual cipherexam.com brand gradient by default.
//
// Brand colors (from G:\Users\daveq\cipher\web\tailwind.config.js):
//   brand-400 #818cf8 → brand-500 #6366f1 → brand-600 #4f46e5 (indigo family)
//   Hero gradient on cipherexam.com: from-brand-400 to-blue-500 (#818cf8 → #3b82f6)
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'top-left',
  gradient = true,
  pill,
}) => {
  // Default: pill on for top-left (it sits over Veo footage), off for hero.
  const showPill = pill ?? variant === 'top-left';
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 200 },
  });

  const translateY = interpolate(p, [0, 1], [variant === 'hero' ? 16 : -6, 0]);

  const iconSize = variant === 'hero' ? 96 : 52;
  const fontSize = variant === 'hero' ? 64 : 34;
  const gap = variant === 'hero' ? 20 : 12;
  const padding = variant === 'hero' ? '0' : '24px 32px';

  return (
    <AbsoluteFill
      style={{
        justifyContent: variant === 'hero' ? 'center' : 'flex-start',
        alignItems: variant === 'hero' ? 'center' : 'flex-start',
        padding,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: variant === 'hero' ? 'column' : 'row',
          alignItems: 'center',
          gap,
          opacity: p,
          transform: `translateY(${translateY}px)`,
          background: showPill
            ? 'rgba(2, 6, 23, 0.92)'
            : 'transparent',
          backdropFilter: showPill ? 'blur(10px)' : undefined,
          WebkitBackdropFilter: showPill ? 'blur(10px)' : undefined,
          padding: showPill ? '10px 22px 10px 18px' : 0,
          borderRadius: showPill ? 999 : 0,
          border: showPill ? '1px solid rgba(99, 102, 241, 0.3)' : 'none',
          boxShadow: showPill ? '0 6px 20px rgba(0, 0, 0, 0.5)' : 'none',
        }}
      >
        <Img
          src={staticFile('cipherexam-logo.png')}
          style={{
            width: iconSize,
            height: iconSize,
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.35))',
          }}
        />
        <div
          style={{
            fontFamily: '"Satoshi", "General Sans", system-ui, sans-serif',
            fontWeight: 700,
            fontSize,
            letterSpacing: '-0.02em',
            background: gradient
              ? 'linear-gradient(135deg, #818cf8 0%, #3b82f6 100%)'
              : undefined,
            WebkitBackgroundClip: gradient ? 'text' : undefined,
            WebkitTextFillColor: gradient ? 'transparent' : '#ffffff',
            color: gradient ? undefined : '#ffffff',
            lineHeight: 1,
          }}
        >
          CipherExam
        </div>
      </div>
    </AbsoluteFill>
  );
};
