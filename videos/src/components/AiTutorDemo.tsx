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
import { AudioTrack } from "./AudioTrack";

type OptionRowProps = {
  letter: string;
  text: string;
  delay: number;
  state: "neutral" | "wrong" | "correct";
};

const OptionRow: React.FC<OptionRowProps> = ({ letter, text, delay, state }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const compact = height < 1500;
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 130 },
  });
  const opacity = interpolate(p, [0, 1], [0, 1]);
  const x = interpolate(p, [0, 1], [-40, 0]);

  let borderColor = theme.border;
  let bg = theme.bgElev;
  let textColor = theme.fg;
  let badge: string | null = null;
  let badgeColor = theme.fgDim;
  let textDecoration: "none" | "line-through" = "none";

  if (state === "wrong") {
    borderColor = theme.bad;
    bg = "rgba(248,113,113,0.10)";
    textColor = theme.fgDim;
    textDecoration = "line-through";
    badge = "Your answer";
    badgeColor = theme.bad;
  } else if (state === "correct") {
    borderColor = theme.good;
    bg = "rgba(74,222,128,0.10)";
    textColor = theme.fg;
    badge = "✓ Correct";
    badgeColor = theme.good;
  }

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        gap: compact ? 18 : 24,
        padding: compact ? "16px 22px" : "26px 32px",
        borderRadius: 18,
        border: `2px solid ${borderColor}`,
        backgroundColor: bg,
        marginBottom: compact ? 12 : 20,
        fontFamily: fontBody,
      }}
    >
      <div
        style={{
          width: compact ? 56 : 72,
          height: compact ? 56 : 72,
          flexShrink: 0,
          borderRadius: compact ? 14 : 16,
          backgroundColor: theme.bg,
          border: `1px solid ${theme.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: compact ? 32 : 40,
          fontWeight: 800,
          color: textColor,
          fontFamily: fontHeading,
        }}
      >
        {letter}
      </div>
      <div
        style={{
          flex: 1,
          fontSize: compact ? 26 : 34,
          fontWeight: 500,
          color: textColor,
          textDecoration,
          lineHeight: 1.3,
        }}
      >
        {text}
      </div>
      {badge && (
        <div
          style={{
            fontSize: compact ? 20 : 26,
            fontWeight: 700,
            color: badgeColor,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            flexShrink: 0,
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
};

const TypewriterLine: React.FC<{
  label: string;
  body: string;
  from: number;
  duration: number;
}> = ({ label, body, from, duration }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const compact = height < 1500;
  const full = body;
  const chars = full.length;
  const t = interpolate(frame, [from, from + duration], [0, chars], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shown = full.slice(0, Math.floor(t));
  const opacity = interpolate(frame, [from, from + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity, marginBottom: compact ? 8 : 24 }}>
      <div
        style={{
          fontSize: compact ? 20 : 28,
          fontWeight: 700,
          color: theme.accent,
          marginBottom: compact ? 2 : 8,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontFamily: fontBody,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: compact ? 24 : 38,
          color: theme.fg,
          fontWeight: 500,
          lineHeight: compact ? 1.25 : 1.3,
          fontFamily: fontBody,
        }}
      >
        {shown}
        {shown.length < full.length && (
          <span style={{ color: theme.accent }}>|</span>
        )}
      </div>
    </div>
  );
};

export const AiTutorDemo: React.FC<{ variant?: ExamVariant }> = ({
  variant = "pmp",
}) => {
  const cfg = VARIANTS[variant];
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  // Compact mode for 4:5 LinkedIn-feed variants (1080×1350) where we
  // need to fit the same content into ~30% less vertical space.
  const compact = height < 1500;

  const headerOpacity = interpolate(frame, [0, 20, 580, 660], [0, 1, 1, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const qSpring = spring({
    frame: frame - 60,
    fps,
    config: { damping: 18, stiffness: 100 },
  });
  const qOpacity = interpolate(qSpring, [0, 1], [0, 1]);
  const qScale = interpolate(qSpring, [0, 1], [0.94, 1]);

  const getOptionState = (letter: string): "neutral" | "wrong" | "correct" => {
    if (letter === cfg.wrongLetter && frame >= 270) return "wrong";
    if (letter === cfg.correctLetter && frame >= 330) return "correct";
    return "neutral";
  };

  const explSpring = spring({
    frame: frame - 390,
    fps,
    config: { damping: 22, stiffness: 110 },
  });
  const explY = interpolate(explSpring, [0, 1], [200, 0]);
  const explOpacity = interpolate(explSpring, [0, 1], [0, 1]);

  const footerOpacity = interpolate(frame, [660, 690], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        fontFamily: fontBody,
        padding: compact ? "36px 56px" : "64px 56px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AudioTrack category="tutor" />
      <div
        style={{
          opacity: headerOpacity,
          textAlign: "center",
          marginBottom: compact ? 16 : 32,
        }}
      >
        <div
          style={{
            fontSize: compact ? 28 : 32,
            color: theme.accent,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: compact ? 6 : 12,
            fontFamily: fontBody,
          }}
        >
          {cfg.lensName}
        </div>
        {!compact && (
          <div
            style={{
              fontSize: 26,
              color: theme.fgMuted,
              fontWeight: 400,
            }}
          >
            AI explanations for every question
          </div>
        )}
      </div>

      <div
        style={{
          opacity: qOpacity,
          transform: `scale(${qScale})`,
          backgroundColor: theme.bgElev,
          border: `1px solid ${theme.border}`,
          borderRadius: 24,
          padding: compact ? "20px 28px" : "30px 34px",
          marginBottom: compact ? 16 : 28,
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: theme.fgDim,
            fontWeight: 600,
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {cfg.questionDomain}
        </div>
        <div
          style={{
            fontSize: 38,
            color: theme.fg,
            fontWeight: 500,
            lineHeight: 1.35,
          }}
        >
          {cfg.questionBody}{" "}
          <span style={{ color: theme.accent, fontWeight: 700 }}>
            {cfg.questionEmphasis}
          </span>
          ?
        </div>
      </div>

      <div>
        {cfg.options.map((opt, i) => (
          <OptionRow
            key={opt.letter}
            letter={opt.letter}
            text={opt.text}
            delay={180 + i * 20}
            state={getOptionState(opt.letter)}
          />
        ))}
      </div>

      <div
        style={{
          opacity: explOpacity,
          transform: `translateY(${explY}px)`,
          backgroundColor: theme.bgElev2,
          border: `1px solid ${theme.border}`,
          borderLeft: `4px solid ${theme.accent}`,
          borderRadius: 18,
          padding: compact ? "14px 20px" : "28px 32px",
          marginTop: compact ? 10 : 24,
        }}
      >
        <TypewriterLine
          label={cfg.explanation[0].label}
          body={cfg.explanation[0].body}
          from={420}
          duration={80}
        />
        <TypewriterLine
          label={cfg.explanation[1].label}
          body={cfg.explanation[1].body}
          from={510}
          duration={70}
        />
        <TypewriterLine
          label={cfg.explanation[2].label}
          body={cfg.explanation[2].body}
          from={585}
          duration={60}
        />
      </div>

      <AbsoluteFill
        style={{
          opacity: footerOpacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 80,
        }}
      >
        <div
          style={{
            backgroundColor: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: 100,
            padding: "20px 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: theme.fg,
              letterSpacing: "0.02em",
              fontFamily: fontHeading,
            }}
          >
            CipherExam
          </div>
          <div
            style={{
              fontSize: 24,
              color: theme.accent,
              marginTop: 4,
            }}
          >
            7-day free trial · cipherexam.com
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
