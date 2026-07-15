import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { theme } from "./theme";
import { fontHeading, fontBody } from "./fonts";

// Short (5s) looping paid-social ad. Works muted: all visual + text, no audio.
// Beat sheet (30fps): brand in → 4 options slide in tangled → wrong ones dim →
// C locks green + "DECODED ✓" pops → headline + CTA land → hold → loop.

const OPTIONS = [
  { k: "A", t: "Escalate to the sponsor immediately", correct: false },
  { k: "B", t: "Update the risk register", correct: false },
  { k: "C", t: "Review the comms plan", correct: true },
  { k: "D", t: "Add them to the next invite", correct: false },
];

const fade = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const AdAllFour: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const RESOLVE = 78;   // wrong ones start dimming
  const LOCK = 92;      // correct locks green

  const headline = spring({ frame: frame - 96, fps, config: { damping: 16, stiffness: 120 } });
  const ctaP = spring({ frame: frame - 118, fps, config: { damping: 15, stiffness: 140 } });
  // gentle looping pulse on the resolved node
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 1.6);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: fontBody, overflow: "hidden" }}>
      {/* glow + grid ground */}
      <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 28% 0%, #12314a 0%, ${theme.bg} 55%, #04070f 100%)` }} />
      <AbsoluteFill
        style={{
          opacity: 0.14,
          backgroundImage: `linear-gradient(${theme.border} 1px, transparent 1px), linear-gradient(90deg, ${theme.border} 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 85% 70% at 50% 22%, #000 35%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 70% at 50% 22%, #000 35%, transparent 78%)",
        }}
      />

      <AbsoluteFill style={{ padding: "64px 80px 64px", display: "flex", flexDirection: "column" }}>
        {/* brand */}
        <div style={{ opacity: fade(frame, 0, 14) }}>
          <div style={{ fontFamily: fontHeading, fontSize: 30, fontWeight: 600, letterSpacing: 1, color: theme.fg }}>
            <span style={{ color: theme.accent }}>⟨</span> CIPHEREXAM <span style={{ color: theme.accent }}>⟩</span>
          </div>
          <div style={{ marginTop: 14, fontSize: 22, letterSpacing: 5, color: theme.fgMuted, fontFamily: fontHeading }}>
            {"// PMP · SECURITY+ · SHRM-CP · 11 CERTS"}
          </div>
        </div>

        {/* options — the hero */}
        <div style={{ position: "relative", flex: 1, marginTop: 40, display: "flex", alignItems: "center" }}>
          {/* tangled connectors */}
          <svg width="1080" height="620" viewBox="0 0 1080 620" style={{ position: "absolute", inset: 0 }}>
            {OPTIONS.map((o, i) => {
              const y = 78 + i * 150;
              const dim = interpolate(frame, [RESOLVE, RESOLVE + 14], [1, o.correct ? 1 : 0.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const draw = fade(frame, 18 + i * 8, 60);
              const col = o.correct ? theme.good : i === 0 ? theme.accentPurple : theme.fgMuted;
              return (
                <path key={i}
                  d={`M700,${y} C860,${y} 900,310 980,310`}
                  fill="none" stroke={col}
                  strokeWidth={o.correct ? 5 : 3}
                  opacity={draw * dim * (o.correct ? 0.95 : 0.6)}
                  strokeDasharray="600" strokeDashoffset={interpolate(draw, [0, 1], [600, 0])}
                />
              );
            })}
            {/* resolved node */}
            <circle cx="980" cy="310" r={interpolate(fade(frame, LOCK, LOCK + 10), [0, 1], [0, 26 + pulse * 8])} fill={theme.good} opacity={0.18} />
            <circle cx="980" cy="310" r={interpolate(fade(frame, LOCK, LOCK + 8), [0, 1], [0, 11])} fill={theme.good} />
          </svg>

          {/* option rows */}
          <div style={{ width: 700, display: "flex", flexDirection: "column", gap: 16, position: "relative", zIndex: 2 }}>
            {OPTIONS.map((o, i) => {
              const p = spring({ frame: frame - (18 + i * 9), fps, config: { damping: 18, stiffness: 130 } });
              const dim = o.correct ? 1 : interpolate(frame, [RESOLVE, RESOLVE + 14], [1, 0.38], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const locked = o.correct && frame >= LOCK;
              const lockP = spring({ frame: frame - LOCK, fps, config: { damping: 12, stiffness: 160 } });
              const scale = locked ? interpolate(lockP, [0, 1], [1, 1.03]) : 1;
              return (
                <div key={i}
                  style={{
                    opacity: interpolate(p, [0, 1], [0, 1]) * dim,
                    transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px) scale(${scale})`,
                    display: "flex", alignItems: "center", gap: 22,
                    padding: "18px 28px", borderRadius: 18,
                    border: `2px solid ${locked ? theme.good : theme.border}`,
                    backgroundColor: locked ? "rgba(52,211,153,0.12)" : theme.bgElev,
                    boxShadow: locked ? `0 0 34px -6px ${theme.good}66` : "none",
                    position: "relative",
                  }}
                >
                  <div style={{ width: 60, height: 60, flexShrink: 0, borderRadius: 14, backgroundColor: theme.bg, border: `1px solid ${locked ? theme.good : theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontHeading, fontWeight: 800, fontSize: 32, color: locked ? theme.good : theme.fgMuted }}>
                    {o.k}
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 500, color: locked ? theme.fg : theme.fgDim }}>{o.t}</div>
                  {locked && (
                    <div style={{ position: "absolute", right: 26, opacity: fade(frame, LOCK + 4, LOCK + 14), fontFamily: fontHeading, fontSize: 22, letterSpacing: 3, color: theme.good, fontWeight: 700 }}>
                      DECODED ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* headline */}
        <div style={{ opacity: interpolate(headline, [0, 1], [0, 1]), transform: `translateY(${interpolate(headline, [0, 1], [24, 0])}px)`, marginTop: 18 }}>
          <div style={{ fontFamily: fontHeading, fontWeight: 800, fontSize: 66, lineHeight: 1.02, letterSpacing: -1.5, color: theme.fg }}>
            All four answers <span style={{ color: theme.accent }}>look right.</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 27, lineHeight: 1.4, color: theme.fgDim, maxWidth: 820 }}>
            The exam tests which one it wants, not what you memorized. CipherExam shows you why.
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 26, opacity: interpolate(ctaP, [0, 1], [0, 1]), transform: `translateY(${interpolate(ctaP, [0, 1], [16, 0])}px)` }}>
          <div style={{ fontFamily: fontHeading, fontWeight: 700, fontSize: 30, letterSpacing: 0.5, backgroundColor: theme.accent, color: "#06121a", borderRadius: 14, padding: "20px 36px" }}>
            Start Free Trial
          </div>
          <div style={{ fontFamily: fontHeading, fontSize: 22, letterSpacing: 1, color: theme.fgMuted }}>
            7-day free trial · no credit card
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
