import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { theme } from "./theme";
import { fontHeading, fontBody } from "./fonts";
import { VARIANTS, type ExamVariant, type Domain } from "../data/examVariants";
import { AudioTrack } from "./AudioTrack";

type BarRowProps = {
  domain: Domain;
  delay: number;
  maxWeight: number;
};

const BarRow: React.FC<BarRowProps> = ({ domain, delay, maxWeight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 110 },
  });
  const opacity = interpolate(entry, [0, 1], [0, 1]);

  const fillProgress = spring({
    frame: frame - (delay + 6),
    fps,
    config: { damping: 18, stiffness: 70 },
  });
  const widthPct = interpolate(
    fillProgress,
    [0, 1],
    [0, (domain.weight / maxWeight) * 100]
  );

  const counterValue = Math.round(
    interpolate(fillProgress, [0, 1], [0, domain.weight])
  );

  return (
    <div
      style={{
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 24,
        marginBottom: 32,
      }}
    >
      <div
        style={{
          width: 280,
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: theme.fgMuted,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: fontBody,
          }}
        >
          Domain {domain.number}
        </div>
        <div
          style={{
            fontSize: 32,
            color: domain.highlight ? theme.accent : theme.fg,
            marginTop: 6,
            lineHeight: 1.15,
            fontWeight: 700,
            fontFamily: fontHeading,
          }}
        >
          {domain.name}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          height: 64,
          backgroundColor: theme.bgElev,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${widthPct}%`,
            height: "100%",
            background: domain.highlight
              ? `linear-gradient(90deg, ${theme.accent}, ${theme.accentPurple})`
              : theme.accent,
            borderRadius: 12,
          }}
        />
      </div>

      <div
        style={{
          width: 150,
          flexShrink: 0,
          fontSize: 64,
          fontWeight: 800,
          color: domain.highlight ? theme.accentPurple : theme.fg,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
          fontFamily: fontHeading,
        }}
      >
        {counterValue}%
      </div>
    </div>
  );
};

export const DomainWeights: React.FC<{ variant?: ExamVariant }> = ({
  variant = "pmp",
}) => {
  const cfg = VARIANTS[variant];
  const frame = useCurrentFrame();

  const titleSpring = spring({
    frame,
    fps: 30,
    config: { damping: 18, stiffness: 110 },
  });
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);
  const titleY = interpolate(titleSpring, [0, 1], [-16, 0]);

  const calloutSpring = spring({
    frame: frame - 240,
    fps: 30,
    config: { damping: 20, stiffness: 110 },
  });
  const calloutOpacity = interpolate(frame, [240, 265, 360, 380], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const calloutScale = interpolate(calloutSpring, [0, 1], [0.92, 1]);

  const footerOpacity = interpolate(frame, [360, 390], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const footerY = interpolate(frame, [360, 390], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const chartOpacity = interpolate(frame, [60, 90, 360, 400], [0, 1, 1, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        fontFamily: fontBody,
        padding: "72px 64px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AudioTrack category="domains" />
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontSize: 26,
            color: theme.accent,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 10,
            fontFamily: fontBody,
          }}
        >
          {cfg.domainTitleEyebrow}
        </div>
        <div
          style={{
            fontSize: 60,
            color: theme.fg,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            fontFamily: fontHeading,
          }}
        >
          {cfg.domainTitleHeading}
        </div>
      </div>

      <div style={{ opacity: chartOpacity, flex: 1, marginTop: 16 }}>
        {cfg.domains.map((d, i) => (
          <BarRow
            key={d.number}
            domain={d}
            delay={60 + i * 18}
            maxWeight={cfg.maxWeight}
          />
        ))}
      </div>

      <AbsoluteFill
        style={{
          opacity: calloutOpacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 64,
        }}
      >
        <div
          style={{
            transform: `scale(${calloutScale})`,
            backgroundColor: theme.bgElev,
            border: `2px solid ${theme.accentPurple}`,
            borderRadius: 24,
            padding: "44px 56px",
            maxWidth: 900,
            textAlign: "center",
            boxShadow: "0 30px 80px rgba(167,139,250,0.25)",
          }}
        >
          <div
            style={{
              fontSize: 30,
              color: theme.accentPurple,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 18,
              fontFamily: fontBody,
            }}
          >
            What this means
          </div>
          <div
            style={{
              fontSize: 42,
              color: theme.fg,
              fontWeight: 600,
              lineHeight: 1.3,
              fontFamily: fontHeading,
            }}
          >
            {cfg.callout}
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          opacity: footerOpacity,
          transform: `translateY(${footerY}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 64,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: theme.fg,
              letterSpacing: "0.02em",
              marginBottom: 14,
              fontFamily: fontHeading,
            }}
          >
            CipherExam
          </div>
          <div
            style={{
              fontSize: 28,
              color: theme.fgDim,
              fontWeight: 400,
            }}
          >
            Learn how certification exams think. 7-day free trial.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
