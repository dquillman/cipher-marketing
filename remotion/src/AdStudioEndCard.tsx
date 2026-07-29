import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EndCard } from './EndCard';

export const AD_STUDIO_END_CARD_DURATION = 84; // 3.5s @ 24fps

type AdStudioEndCardProps = {
  line1: string;
  line2: string;
};

export const AD_STUDIO_END_CARD_DEFAULTS: AdStudioEndCardProps = {
  line1: 'Learn how the exam thinks.',
  line2: 'Start Free Trial · No credit card required · cipherexam.com/lp/pmp',
};

// Standalone end card for ad-studio cuts (e.g. pmp-30s-202607): renders the
// shared EndCard over a solid base so it can be concatenated after any
// live-action clip with FFmpeg instead of compositing inside Remotion.
export const AdStudioEndCard: React.FC<AdStudioEndCardProps> = ({ line1, line2 }) => (
  <AbsoluteFill style={{ backgroundColor: '#020617' }}>
    <EndCard line1={line1} line2={line2} />
  </AbsoluteFill>
);
