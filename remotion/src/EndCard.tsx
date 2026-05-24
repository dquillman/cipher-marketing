import React from 'react';
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

type EndCardProps = {
  line1: string;
  line2: string;
};

// Final brand card — dark slate background, animated logo + headline + URL.
// Lives on top of the previous video so it feels like the close, not a separate scene.
export const EndCard: React.FC<EndCardProps> = ({ line1, line2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background fades in over 18 frames (~0.75s) for a clean wipe over the live video underneath.
  const bgOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Staggered children — logo first, then line1, then line2.
  const logoP = spring({ frame: frame - 6, fps, config: { damping: 100, stiffness: 200 } });
  const line1P = spring({ frame: frame - 18, fps, config: { damping: 100, stiffness: 200 } });
  const line2P = spring({ frame: frame - 28, fps, config: { damping: 100, stiffness: 200 } });

  const logoY = interpolate(logoP, [0, 1], [12, 0]);
  const line1Y = interpolate(line1P, [0, 1], [12, 0]);
  const line2Y = interpolate(line2P, [0, 1], [12, 0]);

  return (
    <>
      {/* Solid background wipe */}
      <AbsoluteFill style={{ backgroundColor: '#020617', opacity: bgOpacity }} />

      {/* Layered content */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          opacity: bgOpacity,
        }}
      >
        {/* Logo — brand icon + gradient wordmark */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            opacity: logoP,
            transform: `translateY(${logoY}px)`,
            marginBottom: 16,
          }}
        >
          <Img
            src={staticFile('cipherexam-logo.png')}
            style={{
              width: 88,
              height: 88,
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 20px rgba(99, 102, 241, 0.45))',
            }}
          />
          <div
            style={{
              fontFamily: '"Satoshi", "General Sans", system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 56,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #818cf8 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}
          >
            CipherExam
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: '"Satoshi", "General Sans", system-ui, sans-serif',
            fontWeight: 800,
            fontSize: 64,
            letterSpacing: '-0.02em',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #818cf8 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            opacity: line1P,
            transform: `translateY(${line1Y}px)`,
          }}
        >
          {line1}
        </div>

        {/* URL */}
        <div
          style={{
            fontFamily: '"General Sans", "Satoshi", system-ui, sans-serif',
            fontWeight: 500,
            fontSize: 28,
            color: '#94a3b8',
            letterSpacing: '0',
            opacity: line2P,
            transform: `translateY(${line2Y}px)`,
            marginTop: 8,
          }}
        >
          {line2}
        </div>
      </AbsoluteFill>
    </>
  );
};
