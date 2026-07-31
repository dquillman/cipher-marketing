import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { theme } from "./theme";
import { fontHeading, fontBody } from "./fonts";

// Converts a post draft's copy into a short, brand-consistent motion video.
// Frame-0 requirement applies (see AdAllFour.tsx): hook, price tag, and CTA
// are all fully composed at frame 0 — only the entrance/emphasis motion is
// animated on top, so autoplay-off viewers still see a complete static ad.

export type PostVideoProps = {
  examName: string;
  examPrice: number | null;
  hookText: string;
  ctaText?: string;
};

const fade = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const PostVideo: React.FC<PostVideoProps> = ({
  examName,
  examPrice,
  hookText,
  ctaText = "Start Free Trial",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tagPulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 1.4);
  const tagSpring = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const tagScale = interpolate(tagSpring, [0, 1], [0.9, 1]);

  // CTA enters at 2s with a slow rise — late enough that its appearance
  // is a noticeable event after the hook lands, not lost in the first blink
  // (Dave, 2026-07-31). Tradeoff: the frame-0 thumbnail shows hook + price
  // but not the CTA; the post copy carries the clickable CTA regardless.
  const CTA_IN = 120;
  const ctaSpring = spring({
    frame: frame - CTA_IN,
    fps,
    config: { damping: 18, stiffness: 60 },
  });
  const ctaOpacity = fade(frame, CTA_IN, CTA_IN + 45);
  const ctaY = interpolate(ctaSpring, [0, 1], [30, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: fontBody, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 0%, #12314a 0%, ${theme.bg} 55%, #04070f 100%)`,
        }}
      />

      <AbsoluteFill style={{ padding: "72px 84px", display: "flex", flexDirection: "column" }}>
        {/* brand chrome — visible from frame 0 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              fontFamily: fontHeading,
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: 1,
              color: theme.fg,
            }}
          >
            <span style={{ color: theme.accent }}>⟨</span> CIPHEREXAM{" "}
            <span style={{ color: theme.accent }}>⟩</span>
          </div>

          {/* exam-price cost anchor — the overlay strategy locked in the
              video-creative-direction memory ("PMP costs $425 to sit.") */}
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
              {/* "exam fee" spelled out — "$425 to sit" was too easy to
                  misread as CipherExam's own price (Dave, 2026-07-31) */}
              <div style={{ fontSize: 19, color: theme.fgDim, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
                {examName} exam fee
              </div>
              <div style={{ fontSize: 24, color: theme.warn, fontWeight: 800, fontFamily: fontHeading }}>
                ${examPrice}
              </div>
            </div>
          )}
        </div>

        {/* hook text — the post's own copy, fully visible from frame 0 */}
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

        {/* CTA — visible from frame 0, gentle settle-in motion on top.
            Deliberately NOT styled as a button: nothing in a video is
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
