import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { theme } from "./theme";
import { fontHeading, fontBody } from "./fonts";

// Two-beat upgrade of PostVideo: hook → supporting line from the post body →
// price + CTA lockup. Same 8s cap, more substance per Dave's 2026-07-31 ask.
// Frame-0 rule still holds: brand, price pill, hook, and CTA are all fully
// composed at frame 0 — the beats animate the CENTER content only.
//
// Beat map @60fps (480 frames):
//   0–170    hook centered
//   170–210  crossfade hook → support line
//   210–310  support line centered
//   310–350  crossfade support → big price lockup (corner pill dims)
//   310–480  price lockup + CTA pulse

export type PostVideoTwoBeatProps = {
  examName: string;
  examPrice: number | null;
  hookText: string;
  supportText: string;
  ctaText?: string;
};

const fade = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const BEAT2_IN = 170;
const BEAT2_HOLD = 210;
const BEAT3_IN = 310;
const BEAT3_HOLD = 350;

export const PostVideoTwoBeat: React.FC<PostVideoTwoBeatProps> = ({
  examName,
  examPrice,
  hookText,
  supportText,
  ctaText = "Start Free Trial",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tagPulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 1.4);
  // Corner pill dims while the center lockup carries the price in beat 3.
  const pillOpacity = examPrice != null
    ? interpolate(frame, [BEAT3_IN, BEAT3_HOLD], [1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  // Beat 1: hook — fully visible at frame 0, exits up as beat 2 lands.
  const hookOpacity = interpolate(frame, [BEAT2_IN, BEAT2_HOLD], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hookY = interpolate(frame, [BEAT2_IN, BEAT2_HOLD], [0, -36], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Beat 2: supporting line — rises in, exits up as beat 3 lands.
  const supportIn = fade(frame, BEAT2_IN + 14, BEAT2_HOLD + 10);
  const supportOut = interpolate(frame, [BEAT3_IN, BEAT3_HOLD], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const supportOpacity = supportIn * supportOut;
  const supportY = interpolate(frame, [BEAT2_IN + 14, BEAT2_HOLD + 10], [36, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    + interpolate(frame, [BEAT3_IN, BEAT3_HOLD], [0, -36], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Beat 3: price lockup — springs in center.
  const lockupSpring = spring({ frame: frame - (BEAT3_IN + 14), fps, config: { damping: 14, stiffness: 120 } });
  const lockupOpacity = fade(frame, BEAT3_IN + 14, BEAT3_HOLD + 6);
  const lockupScale = interpolate(lockupSpring, [0, 1], [0.9, 1]);

  // CTA: visible from frame 0; soft pulse once the lockup lands.
  const ctaPulse = frame >= BEAT3_HOLD ? 1 + 0.03 * Math.sin(((frame - BEAT3_HOLD) / fps) * Math.PI * 1.6) : 1;

  const centerText: React.CSSProperties = {
    fontFamily: fontHeading,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: theme.fg,
    textAlign: "center",
    maxWidth: 900,
  };

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: fontBody, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 0%, #12314a 0%, ${theme.bg} 55%, #04070f 100%)`,
        }}
      />

      <AbsoluteFill style={{ padding: "72px 84px", display: "flex", flexDirection: "column" }}>
        {/* brand chrome + corner price pill — visible from frame 0 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* logo mark inlined from site/assets/logo-mark.svg — avoids
              staticFile/public-dir handling in the function bundle */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="42" height="42" viewBox="0 0 64 64" fill="none">
              <path d="M 32 8 A 24 24 0 1 0 32 56" stroke="#4f46e5" strokeWidth="7" strokeLinecap="round" />
              <path d="M 40 22 L 50 32 L 40 42" stroke="#a5b4fc" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontFamily: fontHeading, fontSize: 30, fontWeight: 600, letterSpacing: 1, color: theme.fg }}>
              CIPHEREXAM
            </div>
          </div>
          {examPrice != null && (
            <div
              style={{
                opacity: pillOpacity,
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
              {/* "exam fee" spelled out — "$425 to sit" was too easy to
                  misread as CipherExam's own price (Dave, 2026-07-31) */}
              <div style={{ fontSize: 24, color: theme.fgDim, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
                {examName} exam fee
              </div>
              <div style={{ fontSize: 32, color: theme.warn, fontWeight: 800, fontFamily: fontHeading }}>
                ${examPrice}
              </div>
            </div>
          )}
        </div>

        {/* center stage — the three beats swap here */}
        <div style={{ flex: 1, position: "relative" }}>
          {/* beat 1: hook */}
          <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...centerText, fontSize: 68, lineHeight: 1.12, opacity: hookOpacity, transform: `translateY(${hookY}px)` }}>
              {hookText}
            </div>
          </AbsoluteFill>

          {/* beat 2: supporting line from the post body */}
          <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...centerText, fontSize: 56, lineHeight: 1.2, fontWeight: 700, opacity: supportOpacity, transform: `translateY(${supportY}px)` }}>
              {supportText}
            </div>
          </AbsoluteFill>

          {/* beat 3: price lockup */}
          {examPrice != null && (
            <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ opacity: lockupOpacity, transform: `scale(${lockupScale})`, textAlign: "center" }}>
                <div style={{ fontFamily: fontHeading, fontWeight: 800, fontSize: 150, lineHeight: 1, color: theme.warn, letterSpacing: "-0.03em" }}>
                  ${examPrice}
                </div>
                <div style={{ marginTop: 18, fontFamily: fontHeading, fontWeight: 700, fontSize: 42, color: theme.fg }}>
                  just to take the {examName} exam.
                </div>
                <div style={{ marginTop: 12, fontSize: 30, color: theme.fgDim, fontFamily: fontBody }}>
                  Walk in knowing how it thinks.
                </div>
              </div>
            </AbsoluteFill>
          )}
        </div>

        {/* CTA — visible from frame 0, pulses in beat 3. Deliberately NOT
            styled as a button: nothing in a video is clickable, so a
            button-look invites dead taps (Dave, 2026-07-31). A URL is
            something a viewer can actually act on. */}
        <div style={{ textAlign: "center", transform: `scale(${ctaPulse})` }}>
          <div style={{ fontFamily: fontHeading, fontWeight: 700, fontSize: 52, letterSpacing: "-0.01em", color: theme.fg }}>
            Start free at <span style={{ color: theme.accent }}>cipherexam.com</span>
          </div>
          <div style={{ marginTop: 12, fontFamily: fontHeading, fontSize: 26, letterSpacing: 1, color: theme.fgMuted }}>
            7-day free trial · no credit card required
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
