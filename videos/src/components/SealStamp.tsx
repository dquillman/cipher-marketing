import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { fontHeading } from "./fonts";

// Gold "60-day money-back guarantee" seal for the ads. Mirrors the app's
// <GuaranteeSeal>: warm gold against the cool Decoder cyan so it reads as
// premium reassurance, not brand chrome.
//
// FRAME-0 REQUIREMENT (Dave, 2026-07-15): the seal is fully settled and
// visible at frame 0 so it lands on the paused/autoplay-off thumbnail — the
// guarantee must never be hidden. The motion is a periodic gold shine-sweep
// (a glint travelling across the metal) plus a faint breathing shimmer, so it
// feels alive without a reveal-from-blank.

const spikes = 44;
const outer = 98;
const inner = 90;
let starburst = "";
for (let i = 0; i < spikes * 2; i++) {
  const r = i % 2 === 0 ? outer : inner;
  const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
  starburst += `${(100 + r * Math.cos(a)).toFixed(2)},${(100 + r * Math.sin(a)).toFixed(2)} `;
}

const Star: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <path
    transform={`translate(${x},${y}) scale(${s})`}
    d="M0,-5 L1.5,-1.5 L5,-1.5 L2,1 L3,5 L0,2.5 L-3,5 L-2,1 L-5,-1.5 L-1.5,-1.5 Z"
    fill="#4A3000"
  />
);

export const SealStamp: React.FC<{
  size?: number;
  tilt?: number;
  /** Frames per shine-sweep cycle. */
  shinePeriod?: number;
}> = ({ size = 260, tilt = -12, shinePeriod = 110 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Glint travels left→right across the seal, then rests off-screen until the
  // next cycle (a wide travel range gives a natural pause between sweeps).
  const t = (frame % shinePeriod) / shinePeriod;
  const shineX = interpolate(t, [0, 1], [-140, 320]);

  // Barely-there breathing so metal feels alive even between glints.
  const breathe = 1 + 0.006 * Math.sin((frame / fps) * Math.PI * 1.2);

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `rotate(${tilt}deg) scale(${breathe})`,
        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))",
      }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <radialGradient id="sealGold" cx="38%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#FFF3C8" />
            <stop offset="40%" stopColor="#FFC93C" />
            <stop offset="78%" stopColor="#E29A0E" />
            <stop offset="100%" stopColor="#A96C00" />
          </radialGradient>
          <linearGradient id="sealShine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFDF3" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <clipPath id="sealClip">
            <circle cx="100" cy="100" r="88" />
          </clipPath>
        </defs>
        <polygon points={starburst.trim()} fill="#B87B00" />
        <circle cx="100" cy="100" r="88" fill="url(#sealGold)" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="#5A3C00" strokeWidth="2.5" opacity="0.9" />
        <circle cx="100" cy="100" r="75" fill="none" stroke="#7A5200" strokeWidth="1.2" strokeDasharray="1.5 5" opacity="0.75" />
        <Star x={100} y={44} s={1.5} />
        <Star x={80} y={49} s={1} />
        <Star x={120} y={49} s={1} />
        <g fill="#3A2600" textAnchor="middle" fontFamily={fontHeading}>
          <path d="M100 60 l15 5.5 v10 c0 11 -7.5 17.5 -15 21 c-7.5 -3.5 -15 -10 -15 -21 v-10 z" fill="#3A2600" />
          <path d="M93.5 77 l4.5 4.5 l9.5 -10.5" fill="none" stroke="#FFC93C" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          <text x="100" y="126" fontSize="33" fontWeight="900" letterSpacing="-1">60-DAY</text>
          <text x="100" y="145" fontSize="15" fontWeight="800" letterSpacing="1.5">MONEY-BACK</text>
          <text x="100" y="160" fontSize="15" fontWeight="800" letterSpacing="1.5">GUARANTEE</text>
          <text x="100" y="175" fontSize="8.5" fontWeight="700" letterSpacing="2.5" opacity="0.8">NO CONDITIONS</text>
        </g>
        {/* gold glint sweeping across the metal — the seal's motion */}
        <g clipPath="url(#sealClip)">
          <rect x={shineX} y={-40} width={46} height={280} fill="url(#sealShine)" transform="rotate(-18 100 100)" />
        </g>
      </svg>
    </div>
  );
};
