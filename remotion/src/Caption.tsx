import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

type CaptionProps = {
  text: string;
  /** If true, uses brand-accent gradient styling instead of plain white. */
  accent?: boolean;
};

// Burned-in caption that appears at the bottom third of the frame.
// Fade-in via spring (frames 0-12), hold, fade-out over last 12 frames.
export const Caption: React.FC<CaptionProps> = ({ text, accent = false }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 200 },
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const opacity = Math.min(fadeIn, fadeOut);
  const translateY = interpolate(fadeIn, [0, 1], [16, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 80,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: '"Satoshi", "General Sans", system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 56,
          color: accent ? '#ffffff' : '#ffffff',
          background: accent
            ? 'linear-gradient(135deg, #818cf8 0%, #3b82f6 100%)'
            : 'transparent',
          WebkitBackgroundClip: accent ? 'text' : undefined,
          WebkitTextFillColor: accent ? 'transparent' : undefined,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          opacity,
          transform: `translateY(${translateY}px)`,
          textShadow: accent ? 'none' : '0 4px 16px rgba(0,0,0,0.7)',
          padding: '0 48px',
          maxWidth: '90%',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
