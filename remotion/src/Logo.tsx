import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Persistent CipherExam wordmark — top-left corner, white.
// Brand: "CipherExam" — one word, both caps. Per cipher-exam-context skill.
export const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gentle entrance — fade in over first 12 frames (0.5s) so it doesn't pop in.
  const opacity = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 200 },
  });

  // Slight downward drift from -8px to 0 for a subtle settle.
  const translateY = interpolate(opacity, [0, 1], [-8, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: '24px 32px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: '"Satoshi", "General Sans", system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 28,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          opacity,
          transform: `translateY(${translateY}px)`,
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}
      >
        CipherExam
      </div>
    </AbsoluteFill>
  );
};
