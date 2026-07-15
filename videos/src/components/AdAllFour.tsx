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

  // FRAME-0 REQUIREMENT (Dave, 2026-07-15): every ad must be fully composed at
  // frame 0 — options, headline, CTA all visible, nothing sliding in from
  // blank. Autoplay-off viewers see frame 0 as the thumbnail, and autoplay
  // viewers judge the ad in the first split-second. Frame 0 here IS the
  // static ad; the motion is the dim -> resolve -> DECODED drama on top.
  const RESOLVE = 45;   // wrong ones start dimming
  const LOCK = 62;      // correct locks green
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
        {/* brand — visible from frame 0 */}
        <div>
          <div style={{ fontFamily: fontHeading, fontSize: 30, fontWeight: 600, letterSpacing: 1, color: theme.fg }}>
            <span style={{ color: theme.accent }}>⟨</span> CIPHEREXAM <span style={{ color: theme.accent }}>⟩</span>
          </div>
          <div style={{ marginTop: 14, fontSize: 22, letterSpacing: 5, color: theme.fgMuted, fontFamily: fontHeading }}>
            {"// PMP · SECURITY+ · SHRM-CP · 11 CERTS"}
          </div>
        </div>

        {/* options + connectors — a fixed 920×432 unit that flex-centers, so
            the wires track the option rows identically at 1:1 and 4:5. */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", marginTop: 32 }}>
          <div style={{ position: "relative", width: 920, height: 432 }}>
          {/* tangled connectors (block coordinate space; overflow visible for node glow) */}
          <svg viewBox="0 0 920 432" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
            {OPTIONS.map((o, i) => {
              const y = 50 + i * 111;  // ≈ centers of the 4 space-between rows
              const dim = interpolate(frame, [RESOLVE, RESOLVE + 14], [1, o.correct ? 1 : 0.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              // fully drawn at frame 0; subtle shimmer gives pre-resolve life
              const shimmer = frame < RESOLVE ? 0.75 + 0.25 * Math.sin(frame / 5 + i * 1.7) : 1;
              const col = o.correct ? theme.good : i === 0 ? theme.accentPurple : theme.fgMuted;
              return (
                <path key={i}
                  d={`M700,${y} C812,${y} 850,216 900,216`}
                  fill="none" stroke={col}
                  strokeWidth={o.correct ? 5 : 3}
                  opacity={dim * shimmer * (o.correct ? 0.95 : 0.6)}
                />
              );
            })}
            {/* resolved node */}
            <circle cx="900" cy="216" r={interpolate(fade(frame, LOCK, LOCK + 10), [0, 1], [0, 26 + pulse * 8])} fill={theme.good} opacity={0.18} />
            <circle cx="900" cy="216" r={interpolate(fade(frame, LOCK, LOCK + 8), [0, 1], [0, 11])} fill={theme.good} />
          </svg>

          {/* option rows */}
          <div style={{ width: 700, height: 432, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
            {OPTIONS.map((o, i) => {
              // rows fully visible at frame 0 (frame-0 requirement); only the
              // resolve/dim/lock states animate
              const dim = o.correct ? 1 : interpolate(frame, [RESOLVE, RESOLVE + 14], [1, 0.38], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const locked = o.correct && frame >= LOCK;
              const lockP = spring({ frame: frame - LOCK, fps, config: { damping: 12, stiffness: 160 } });
              const scale = locked ? interpolate(lockP, [0, 1], [1, 1.03]) : 1;
              return (
                <div key={i}
                  style={{
                    opacity: dim,
                    transform: `scale(${scale})`,
                    display: "flex", alignItems: "center", gap: 22,
                    padding: "16px 28px", borderRadius: 18,
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
        </div>

        {/* headline — visible from frame 0 */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontFamily: fontHeading, fontWeight: 800, fontSize: 66, lineHeight: 1.02, letterSpacing: -1.5, color: theme.fg }}>
            All four answers <span style={{ color: theme.accent }}>look right.</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 27, lineHeight: 1.4, color: theme.fgDim, maxWidth: 820 }}>
            The exam tests which one it wants, not what you memorized. CipherExam shows you why.
          </div>
        </div>

        {/* CTA — visible from frame 0 */}
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 26 }}>
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
