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
      {/* Solid pill background — guarantees coverage of any underlying video text
          (e.g. Veo's hallucinated "$CipherExam$" mangle). */}
      <div
        style={{
          fontFamily: '"Satoshi", "General Sans", system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 28,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          opacity,
          transform: `translateY(${translateY}px)`,
          background: 'rgba(2, 6, 23, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '8px 18px',
          borderRadius: 999,
          border: '1px solid rgba(99, 102, 241, 0.25)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        }}
      >
        CipherExam
      </div>
    </AbsoluteFill>
  );
};
