import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Full-width brand header strip — covers the top 120px of the frame.
// Purpose: hide Veo's hallucinated text artifacts ("$CipherExam$", "$425$")
// that always render in the top corners of generated clips. By making this
// a deliberate-looking brand header rather than a localized cover, the
// effect reads as intentional design, not censorship.
export const TopBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gentle entrance on the wordmark so it doesn't pop in.
  const p = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 200 },
  });

  const translateY = interpolate(p, [0, 1], [-6, 0]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Solid slate header bar — full width, 120px tall.
          Subtle bottom fade so it doesn't look like a hard cut against the video. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 120,
          background:
            'linear-gradient(180deg, #020617 0%, #020617 80%, rgba(2,6,23,0.7) 100%)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.18)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
      />

      {/* CipherExam wordmark inside the header. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 120,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 40,
        }}
      >
        <div
          style={{
            fontFamily:
              '"Satoshi", "General Sans", system-ui, -apple-system, sans-serif',
            fontWeight: 700,
            fontSize: 36,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            opacity: p,
            transform: `translateY(${translateY}px)`,
          }}
        >
          CipherExam
        </div>
      </div>
    </AbsoluteFill>
  );
};
