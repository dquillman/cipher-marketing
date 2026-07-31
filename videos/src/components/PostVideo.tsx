import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { theme } from "./theme";
import { fontHeading, fontBody } from "./fonts";
import { VIDEO_THEMES } from "../data/videoThemes";

// Converts a post draft's copy into a short, brand-consistent motion video.
// Mirrored by functions/remotion/PostVideo.jsx (the deploy bundle) — keep the
// two in sync by hand.
//
// The visual format comes from videoThemes.js and rotates by week, so one
// week's posts share a look and consecutive weeks differ. Brand palette,
// copy rules, and CTA timing stay constant across every format.

const fade = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export type PostVideoProps = {
  examName: string;
  examPrice: number | null;
  hookText: string;
  ctaText?: string;
  themeId?: string;
  chipLabel?: string | null;
  chipValue?: string | null;
};

export const PostVideo: React.FC<PostVideoProps> = ({
  examName,
  examPrice,
  hookText,
  ctaText = "Start Free Trial",
  themeId,
  chipLabel,
  chipValue,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = VIDEO_THEMES.find((x) => x.id === themeId) || VIDEO_THEMES[0];

  const tagPulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 1.4);

  // CTA must be FULLY visible at the 2s mark (Dave, 2026-07-31) — the fade
  // starts at ~1.7s and completes at exactly 2.0s. An earlier version STARTED
  // a slow spring fade at 2s that did not settle until ~3s, which read as
  // arriving much later than 2s. Identical across every format.
  const CTA_VISIBLE_AT = 120; // frame the CTA is fully planted (2s @60fps)
  const CTA_FADE = 18;
  const ctaOpacity = fade(frame, CTA_VISIBLE_AT - CTA_FADE, CTA_VISIBLE_AT);
  const ctaY = interpolate(frame, [CTA_VISIBLE_AT - CTA_FADE, CTA_VISIBLE_AT], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const leftAligned = t.align === "left";

  const hookStyle: React.CSSProperties = {
    fontFamily: fontHeading,
    fontWeight: 800,
    fontSize: 68,
    lineHeight: 1.12,
    letterSpacing: "-0.02em",
    color: theme.fg,
    textAlign: leftAligned ? "left" : "center",
    maxWidth: 900,
  };

  const hookInner = t.underline ? (
    <span style={{ boxShadow: `inset 0 -14px 0 ${t.accent}33` }}>{hookText}</span>
  ) : (
    hookText
  );

  let hookBlock = <div style={hookStyle}>{hookInner}</div>;

  if (t.hookCard) {
    hookBlock = (
      <div
        style={{
          backgroundColor: t.panel,
          border: `1px solid ${t.border}`,
          borderRadius: 24,
          padding: "48px 56px",
          maxWidth: 940,
          boxShadow: `0 0 60px -20px ${t.accent}44`,
        }}
      >
        <div style={hookStyle}>{hookInner}</div>
      </div>
    );
  } else if (t.accentBar) {
    hookBlock = (
      <div style={{ display: "flex", gap: 34, alignItems: "stretch", maxWidth: 960 }}>
        <div style={{ width: 8, borderRadius: 8, backgroundColor: t.accent, flexShrink: 0 }} />
        <div style={hookStyle}>{hookInner}</div>
      </div>
    );
  }

  const pillSolid = t.pill === "solid";

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: fontBody, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: t.bg }} />

      {t.grid && (
        <AbsoluteFill
          style={{
            opacity: 0.16,
            backgroundImage: `linear-gradient(${t.border} 1px, transparent 1px), linear-gradient(90deg, ${t.border} 1px, transparent 1px)`,
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 85% 75% at 50% 40%, #000 35%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 40%, #000 35%, transparent 80%)",
          }}
        />
      )}

      <AbsoluteFill style={{ padding: "72px 84px", display: "flex", flexDirection: "column" }}>
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

          {chipValue != null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 22px",
                borderRadius: 999,
                border: `1px solid ${pillSolid ? t.accent : t.border}`,
                backgroundColor: pillSolid ? t.accent : t.panel,
                boxShadow: `0 0 ${18 + tagPulse * 10}px -6px ${t.accent}55`,
              }}
            >
              {/* Contextual chip — states the fact that supports THIS post.
                  The $425 fee is reserved for cost/risk posts so it keeps its
                  punch instead of becoming wallpaper (Dave, 2026-07-31). */}
              <div
                style={{
                  fontSize: 24,
                  color: pillSolid ? "#1a1206" : theme.fgDim,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                {chipLabel}
              </div>
              <div
                style={{
                  fontSize: 32,
                  color: pillSolid ? "#1a1206" : t.accent,
                  fontWeight: 800,
                  fontFamily: fontHeading,
                }}
              >
                {chipValue}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: leftAligned ? "flex-start" : "center",
          }}
        >
          {hookBlock}
        </div>

        {/* Deliberately NOT styled as a button: nothing in a video is
            clickable, so a button-look invites dead taps (Dave, 2026-07-31).
            A URL is something a viewer can actually act on. */}
        <div
          style={{
            opacity: ctaOpacity,
            transform: `translateY(${ctaY}px)`,
            textAlign: leftAligned ? "left" : "center",
          }}
        >
          <div style={{ fontFamily: fontHeading, fontWeight: 700, fontSize: 52, letterSpacing: "-0.01em", color: theme.fg }}>
            Start free at <span style={{ color: t.accent }}>cipherexam.com</span>
          </div>
          <div style={{ marginTop: 12, fontFamily: fontHeading, fontSize: 26, letterSpacing: 1, color: theme.fgMuted }}>
            7-day free trial · no credit card required
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
