import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { theme } from "./theme";
import { fontHeading, fontBody } from "./fonts";
import { VARIANTS, type ExamVariant } from "../data/examVariants";

type FadeLineProps = {
  text: string;
  from: number;
  to: number;
  size: number;
  weight: number;
  color: string;
  font?: string;
  letterSpacing?: string;
};

const FadeLine: React.FC<FadeLineProps> = ({
  text,
  from,
  to,
  size,
  weight,
  color,
  font = fontHeading,
  letterSpacing = "-0.02em",
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [from, from + 15, to - 15, to],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const translateY = interpolate(frame, [from, from + 24], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 96,
        textAlign: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          color,
          fontFamily: font,
          fontWeight: weight,
          fontSize: size,
          lineHeight: 1.16,
          letterSpacing,
          maxWidth: 920,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const LaunchTeaser: React.FC<{ variant?: ExamVariant }> = ({
  variant = "pmp",
}) => {
  const cfg = VARIANTS[variant];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({
    frame: frame - 225,
    fps,
    config: { damping: 18, stiffness: 110 },
  });
  const logoOpacity = interpolate(
    frame,
    [225, 245, 285, 300],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const logoY = interpolate(logoSpring, [0, 1], [22, 0]);

  const ctaSpring = spring({
    frame: frame - 285,
    fps,
    config: { damping: 16, stiffness: 110 },
  });
  const ctaOpacity = interpolate(frame, [285, 305], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.92, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: fontBody }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(125,211,252,0.10) 0%, rgba(2,6,23,0) 65%)",
        }}
      />

      <FadeLine
        text={cfg.hookLine1}
        from={0}
        to={90}
        size={62}
        weight={500}
        color={theme.fgDim}
        font={fontBody}
        letterSpacing="0"
      />

      <FadeLine
        text={cfg.hookLine2}
        from={75}
        to={165}
        size={72}
        weight={700}
        color={theme.fg}
      />

      <FadeLine
        text={cfg.hookLine3}
        from={150}
        to={235}
        size={88}
        weight={800}
        color={theme.accent}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: logoOpacity,
          transform: `translateY(${logoY}px)`,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: "0.02em",
              color: theme.fg,
              fontFamily: fontHeading,
            }}
          >
            CipherExam
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 400,
              color: theme.fgMuted,
              marginTop: 18,
              letterSpacing: "0.02em",
              fontFamily: fontBody,
            }}
          >
            AI-powered certification exam prep
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
        }}
      >
        <div
          style={{
            backgroundColor: theme.bgElev,
            border: `1px solid ${theme.border}`,
            borderRadius: 28,
            padding: "56px 80px",
            textAlign: "center",
            boxShadow: "0 24px 80px rgba(125,211,252,0.18)",
            fontFamily: fontBody,
          }}
        >
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              color: theme.fg,
              marginBottom: 4,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              fontFamily: fontHeading,
            }}
          >
            7 days free
          </div>
          <div
            style={{
              fontSize: 32,
              color: theme.fgDim,
              marginBottom: 26,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            No card. Cancel anytime.
          </div>
          <div
            style={{
              fontSize: 40,
              color: theme.accent,
              fontWeight: 700,
            }}
          >
            cipherexam.com
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
