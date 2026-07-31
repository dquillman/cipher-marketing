import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { theme } from "./theme.js";
import { fontHeading, fontBody } from "./fonts.js";

// Deploy-scoped copy of videos/src/components/PostVideo.tsx — see theme.js
// for why this is duplicated instead of imported from the sibling project.
// Keep these two files in sync by hand when the template changes.

const fade = (frame, a, b) =>
  interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const PostVideo = ({ examName, examPrice, hookText, ctaText = "Start Free Trial" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tagPulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 1.4);
  const tagSpring = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const tagScale = interpolate(tagSpring, [0, 1], [0.9, 1]);

  const ctaSpring = spring({ frame: frame - 20, fps, config: { damping: 16, stiffness: 120 } });
  const ctaOpacity = fade(frame, 20, 38);
  const ctaY = interpolate(ctaSpring, [0, 1], [14, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: fontBody, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 0%, #12314a 0%, ${theme.bg} 55%, #04070f 100%)`,
        }}
      />

      <AbsoluteFill style={{ padding: "72px 84px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: fontHeading, fontSize: 30, fontWeight: 600, letterSpacing: 1, color: theme.fg }}>
            <span style={{ color: theme.accent }}>⟨</span> CIPHEREXAM <span style={{ color: theme.accent }}>⟩</span>
          </div>

          {examPrice != null && (
            <div
              style={{
                transform: `scale(${tagScale})`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 22px",
                borderRadius: 999,
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.bgElev,
                boxShadow: `0 0 ${18 + tagPulse * 10}px -6px ${theme.warn}55`,
              }}
            >
              <div style={{ fontSize: 20, color: theme.fgDim, fontWeight: 500 }}>{examName}</div>
              <div style={{ fontSize: 24, color: theme.warn, fontWeight: 800, fontFamily: fontHeading }}>
                ${examPrice}
              </div>
              <div style={{ fontSize: 16, color: theme.fgMuted, letterSpacing: 0.5, textTransform: "uppercase" }}>
                to sit
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              fontFamily: fontHeading,
              fontWeight: 800,
              fontSize: 68,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              color: theme.fg,
              textAlign: "center",
              maxWidth: 900,
            }}
          >
            {hookText}
          </div>
        </div>

        {/* Deliberately NOT styled as a button: nothing in a video is
            clickable, so a button-look invites dead taps (Dave, 2026-07-31).
            A URL is something a viewer can actually act on. */}
        <div
          style={{
            opacity: ctaOpacity,
            transform: `translateY(${ctaY}px)`,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: fontHeading, fontWeight: 700, fontSize: 52, letterSpacing: "-0.01em", color: theme.fg }}>
            Start free at <span style={{ color: theme.accent }}>cipherexam.com</span>
          </div>
          <div style={{ marginTop: 12, fontFamily: fontHeading, fontSize: 26, letterSpacing: 1, color: theme.fgMuted }}>
            7-day free trial · no credit card
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
